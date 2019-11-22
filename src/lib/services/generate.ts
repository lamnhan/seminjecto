import { EOL } from 'os';
import { resolve } from 'path';

import { FileService } from './file';

export type GenerateType = 'service' | 'command';

export class GenerateService {

  constructor(
    private fileService: FileService
  ) {}

  generate(type: GenerateType, dest: string) {
    if (type === 'service') {
      return this.getServiceData(dest);
    } else if (type === 'command') {
      return this.getCommandData(dest);
    } else {
      throw new Error('Not support type: ' + type);
    }
  }

  modify(type: GenerateType, path: string) {
    const importPath = path;
    const name = (
      path.replace(/\\/g, '').split('/').pop() as string
    ).replace('.ts', '');
    const titleName = name.charAt(0).toUpperCase() + name.substr(1);
    if (type === 'service') {
      return this.modificationForService(importPath, name, titleName);
    } else if (type === 'command') {
      return this.modificationForCommand(importPath, name, titleName);
    } else {
      throw new Error('Not support type: ' + type);
    }
  }

  private modificationForService(importPath: string, name: string, titleName: string) {
    importPath = importPath.replace('src/lib/', './');
    const varName = `${name}Service`;
    const className = `${titleName}Service`;
    // src/lib/main.ts
    return this.fileService.changeContent(
      resolve('src', 'lib', 'main.ts'),
      content => {
        content = content
          // import ...
          .replace(
            EOL + 'export class Main {',
            [
              `import { ${className} } from '${importPath}';`,
              '',
              'export class Main {'
            ].join(EOL)
          )
          // variable
          .replace(
            EOL + '  constructor(',
            [
              `  private ${varName}: ${className};`,
              '',
              '  constructor('
            ].join(EOL)
          );
        // init
        let cstrContent = content.substr(content.indexOf('constructor('));
        cstrContent = cstrContent.substring(0, cstrContent.indexOf('}'));
        content = content
          .replace(
            cstrContent,
            cstrContent
            + `  this.${varName} = new ${className}();`
            + EOL
            + '  '
          );
        // get
        content = content.substring(0, content.lastIndexOf('}'))
          + [
              `  get ${titleName}() {`,
              `    return this.${varName};`,
              '  }',
              '',
              '}',
              ''
            ].join(EOL);
        return content;
      }
    );
  }

  private modificationForCommand(importPath: string, name: string, titleName: string) {
    importPath = importPath.replace('src/cli/', './');
    const varName = `${name}Command`;
    const className = `${titleName}Command`;
    // src/cli/index.ts
    return this.fileService.changeContent(
      resolve('src', 'cli', 'index.ts'),
      content => {
        content = content
          // import ...
          .replace(
            EOL + 'export class Cli {',
            [
              `import { ${className} } from '${importPath}';`,
              '',
              'export class Cli {'
            ].join(EOL)
          )
          // variable
          .replace(
            EOL + '  commander = [',
            [
              `  private ${varName}: ${className};`,
              '',
              '  commander = ['
            ].join(EOL)
          )
          // command def
          .replace(
            '  constructor(',
            [
              `  ${name}CommandDef: CommandDef = [`,
              `    '${name}', 'Command description.'`,
              `  ];`,
              '',
              '  constructor('
            ].join(EOL)
          );
        // init
        let constructorContent = content.substr(content.indexOf('constructor('));
        constructorContent = constructorContent.substring(
          0, constructorContent.indexOf('}')
        );
        content = content
          .replace(
            constructorContent,
            constructorContent
            + `  this.${varName} = new ${className}();`
            + EOL
            + '  '
          );
        // command
        content = content
          .replace(
            `// help`,
            [
              `// ${name}`,
              `    (() => {`,
              `      const [ command, description ] = this.${name}CommandDef;`,
              `      commander`,
              `        .command(command)`,
              `        .description(description)`,
              `        .action(() => this.${varName}.run());`,
              `    })();`,
              '',
              `    // help`
            ].join(EOL)
          );
        return content;
      }
    );
  }

  private getServiceData(dest: string) {
    const destData = this.processDest(dest, 'lib');
    // content
    const { className } = destData;
    const content = [
      '',
      `export class ${className}Service {`,
      '',
      '  constructor () {}',
      '',
      '}',
      ''
    ].join(EOL);
    // result
    return { ...destData, content };
  }

  private getCommandData(dest: string) {
    const destData = this.processDest(dest, 'cli');
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
      ''
    ].join(EOL);
    // result
    return { ...destData, content };
  }

  private processDest(dest: string, part = 'lib') {
    const destSplit = dest.split('/');
    const name = (destSplit.pop() as string).split('.')[0].toLowerCase();
    const className = name.charAt(0).toUpperCase() + name.substr(1);
    const path = ['src', part, ...destSplit, `${name}.ts`].join('/');
    const fullPath = resolve(path);
    return { name, className, path, fullPath };
  }

}