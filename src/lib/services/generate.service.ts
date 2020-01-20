import { resolve } from 'path';

import { FileService } from './file.service';

export class GenerateService {
  constructor(private fileService: FileService) {}

  private processDest(type: string, dest: string, part = 'lib') {
    const destSplit = dest.split('/');
    const name = (destSplit.pop() as string).split('.')[0].toLowerCase();
    const className = name.charAt(0).toUpperCase() + name.substr(1);
    const path = ['src', part, ...destSplit, `${name}.${type}.ts`].join('/');
    const fullPath = resolve(path);
    return { name, className, path, fullPath };
  }

  generate(type: string, dest: string) {
    if (type === 'service') {
      return this.getServiceData(type, dest);
    } else if (type === 'command') {
      return this.getCommandData(type, dest);
    } else {
      return this.getAnyTypeData(type, dest);
    }
  }

  modify(type: string, path: string) {
    const name = (path
      .replace(/\\/g, '')
      .split('/')
      .pop() as string).replace('.ts', '');
    const titleName = name.charAt(0).toUpperCase() + name.substr(1);
    if (type === 'service') {
      return this.modificationForService(path, name, titleName);
    } else if (type === 'command') {
      return this.modificationForCommand(path, name, titleName);
    } else {
      return this.modificationForAnyType(type, path, name, titleName);
    }
  }

  private async modificationForService(
    path: string,
    name: string,
    titleName: string
  ) {
    const importPath = path.replace('src/lib/', './').replace('.ts', '');
    const exportPath = importPath.replace('./', './lib/');
    const varName = `${name}Service`;
    const className = `${titleName}Service`;
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve('src', 'public-api.ts'),
      content => content + `\nexport * from '${exportPath}';`
    );
    // src/lib/index.ts
    return this.fileService.changeContent(
      resolve('src', 'lib', 'index.ts'),
      content => {
        content = content
          // import ...
          .replace(
            '\nexport class Main {',
            [
              `import { ${className} } from '${importPath}';`,
              '',
              'export class Main {',
            ].join('\n')
          )
          // variable
          .replace(
            '\n  constructor(',
            [`  ${varName}: ${className};`, '', '  constructor('].join('\n')
          );
        // init
        let cstrContent = content.substr(content.indexOf('constructor('));
        cstrContent = cstrContent.substring(0, cstrContent.indexOf('}'));
        content = content.replace(
          cstrContent,
          cstrContent + `  this.${varName} = new ${className}();` + '\n' + '  '
        );
        return content;
      }
    );
  }

  private async modificationForCommand(
    path: string,
    name: string,
    titleName: string
  ) {
    const importPath = path.replace('src/cli/', './').replace('.ts', '');
    const exportPath = importPath.replace('./', './cli/');
    const varName = `${name}Command`;
    const className = `${titleName}Command`;
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve('src', 'public-api.ts'),
      content => content + `\nexport * from '${exportPath}';`
    );
    // src/cli/index.ts
    return this.fileService.changeContent(
      resolve('src', 'cli', 'index.ts'),
      content => {
        content = content
          // import ...
          .replace(
            '\nexport class Cli {',
            [
              `import { ${className} } from '${importPath}';`,
              '',
              'export class Cli {',
            ].join('\n')
          )
          // variable
          .replace(
            '\n  commander = [',
            [`  ${varName}: ${className};`, '', '  commander = ['].join('\n')
          )
          // command def
          .replace(
            '  constructor(',
            [
              `  ${name}CommandDef: CommandDef = [`,
              `    '${name}', 'Command description.'`,
              `  ];`,
              '',
              '  constructor(',
            ].join('\n')
          );
        // init
        let constructorContent = content.substr(
          content.indexOf('constructor(')
        );
        constructorContent = constructorContent.substring(
          0,
          constructorContent.indexOf('}')
        );
        content = content.replace(
          constructorContent,
          constructorContent +
            `  this.${varName} = new ${className}();` +
            '\n' +
            '  '
        );
        // command
        content = content.replace(
          `// help`,
          [
            `// ${name}`,
            `    (() => {`,
            `      const [command, description] = this.${name}CommandDef;`,
            `      commander`,
            `        .command(command)`,
            `        .description(description)`,
            `        .action(() => this.${varName}.run());`,
            `    })();`,
            '',
            `    // help`,
          ].join('\n')
        );
        return content;
      }
    );
  }

  private async modificationForAnyType(
    type: string,
    path: string,
    name: string,
    titleName: string
  ) {
    const classSurfix = type.charAt(0).toUpperCase() + type.substr(1);
    const importPath = path.replace('src/lib/', './').replace('.ts', '');
    const exportPath = importPath.replace('./', './lib/');
    const varName = `${name}${classSurfix}`;
    const className = `${titleName}${classSurfix}`;
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve('src', 'public-api.ts'),
      content => content + `\nexport * from '${exportPath}';`
    );
    // src/lib/index.ts
    return this.fileService.changeContent(
      resolve('src', 'lib', 'index.ts'),
      content => {
        content = content
          // import ...
          .replace(
            '\nexport class Main {',
            [
              `import { ${className} } from '${importPath}';`,
              '',
              'export class Main {',
            ].join('\n')
          )
          // variable
          .replace(
            '\n  constructor(',
            [`  ${varName}: ${className};`, '', '  constructor('].join('\n')
          );
        // init
        let cstrContent = content.substr(content.indexOf('constructor('));
        cstrContent = cstrContent.substring(0, cstrContent.indexOf('}'));
        content = content.replace(
          cstrContent,
          cstrContent + `  this.${varName} = new ${className}();` + '\n' + '  '
        );
        return content;
      }
    );
  }

  private getServiceData(type: string, dest: string) {
    const destData = this.processDest(type, dest, 'lib');
    // content
    const { className } = destData;
    const content = [
      '',
      `export class ${className}Service {`,
      '',
      '  constructor () {}',
      '',
      '}',
      '',
    ].join('\n');
    // result
    return { ...destData, content };
  }

  private getCommandData(type: string, dest: string) {
    const destData = this.processDest(type, dest, 'cli');
    // content
    const { className } = destData;
    const content = [
      '',
      `export class ${className}Command {`,
      '',
      '  constructor () {}',
      '',
      '  run() {}',
      '',
      '}',
      '',
    ].join('\n');
    // result
    return { ...destData, content };
  }

  private getAnyTypeData(type: string, dest: string) {
    const destData = this.processDest(type, dest, 'lib');
    // content
    const { className } = destData;
    const classSurfix = type.charAt(0).toUpperCase() + type.substr(1);
    const content = [
      '',
      `export class ${className}${classSurfix} {`,
      '',
      '  constructor () {}',
      '',
      '}',
      '',
    ].join('\n');
    // result
    return { ...destData, content };
  }

}
