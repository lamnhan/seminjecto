import {resolve} from 'path';

import {FileService} from './file.service';

export class GenerateService {
  constructor(private fileService: FileService) {}

  private processDest(type: string, dest: string, part = 'lib') {
    const destSplit = dest.split('/');
    const name = (destSplit.pop() as string).split('.')[0].toLowerCase();
    const className = name.charAt(0).toUpperCase() + name.substr(1);
    const path = ['src', part, ...destSplit, `${name}.${type}.ts`].join('/');
    const fullPath = resolve(path);
    return {name, className, path, fullPath};
  }

  generate(type: string, dest: string) {
    const part = type === 'route' ? 'app' : type === 'command' ? 'cli' : 'lib';
    const body: string[] =
      type === 'command' ? ['run() {}'] : type === 'route' ? ['get() {}'] : [];
    return this.getTemplateData(type, dest, part, body);
  }

  modify(type: string, path: string) {
    const name = (path.replace(/\\/g, '').split('/').pop() as string)
      .replace('.ts', '')
      .split('.')
      .shift() as string;
    const titleName = name.charAt(0).toUpperCase() + name.substr(1);
    if (type === 'command') {
      return this.modificationForCommand(path, name, titleName);
    } else if (type === 'service') {
      return this.modificationForAnyType(
        type,
        path,
        name,
        titleName,
        'lib',
        'Lib'
      );
    } else if (type === 'route') {
      return this.modificationForAnyType(
        type,
        path,
        name,
        titleName,
        'app',
        'App'
      );
    } else {
      return this.modificationForAnyType(
        type,
        path,
        name,
        titleName,
        'lib',
        'Lib'
      );
    }
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
              '  ];',
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
          '// help',
          [
            `// ${name}`,
            '    (() => {',
            `      const [command, description] = this.${name}CommandDef;`,
            '      commander',
            '        .command(command)',
            '        .description(description)',
            `        .action(() => this.${varName}.run());`,
            '    })();',
            '',
            '    // help',
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
    titleName: string,
    part: string,
    parentName: string
  ) {
    const classSurfix = type.charAt(0).toUpperCase() + type.substr(1);
    const importPath = path.replace(`src/${part}/`, './').replace('.ts', '');
    const exportPath = importPath.replace('./', `./${part}/`);
    const varName = `${name}${classSurfix}`;
    const className = `${titleName}${classSurfix}`;
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve('src', 'public-api.ts'),
      content => content + `\nexport * from '${exportPath}';`
    );
    // src/<part>/index.ts
    return this.fileService.changeContent(
      resolve('src', part, 'index.ts'),
      content => {
        content = content
          // import ...
          .replace(
            `\nexport class ${parentName} {`,
            [
              `import { ${className} } from '${importPath}';`,
              '',
              `export class ${parentName} {`,
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

  private getTemplateData(
    type: string,
    dest: string,
    part: string,
    body: string[] = []
  ) {
    const destData = this.processDest(type, dest, part);
    // content
    const {className} = destData;
    const classSurfix = type.charAt(0).toUpperCase() + type.substr(1);
    if (body.length > 0) {
      body = body.map(x => (x.substr(0, 2) === '  ' ? x : `  ${x}`));
      body.unshift('');
    }
    const content = [
      '',
      `export class ${className}${classSurfix} {`,
      '',
      '  constructor() {}',
      ...body,
      '',
      '}',
      '',
    ].join('\n');
    // result
    return {...destData, content};
  }
}
