import {resolve} from 'path';

import {FileService} from './file.service';

export class ModifyService {
  constructor(private fileService: FileService) {}

  modify(type: string, path: string) {
    const name = (path.replace(/\\/g, '').split('/').pop() as string)
      .replace('.ts', '')
      .split('.')
      .shift() as string;
    const titleName = name.charAt(0).toUpperCase() + name.substr(1);
    if (type === 'sidebar') {
      return this.modificationForSidebar(path, name, titleName);
    } else if (type === 'modal') {
      return this.modificationForModal(path, name, titleName);
    } else if (type === 'command') {
      return this.modificationForCommand(path, name, titleName);
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

  private async modificationForSidebar(
    path: string,
    name: string,
    titleName: string
  ) {
    const importPath = path.replace('src/addon/', './').replace('.ts', '');
    const exportPath = importPath.replace('./', './addon/');
    const alternatedExportPath = exportPath + '.server';
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve('src', 'public-api.ts'),
      content => content + `\nexport * from '${alternatedExportPath}';`
    );
    // src/addon/index.ts
    return this.fileService.changeContent(
      resolve('src', 'addon', 'index.ts'),
      content => {
        content = content
          // menu item
          .replace(
            ".addItem('Help', 'helpSidebar')",
            [
              `.addItem('${titleName}', '${name}Sidebar')`,
              "      .addItem('Help', 'helpSidebar')",
            ].join('\n')
          );
        return content;
      }
    );
  }

  private async modificationForModal(
    path: string,
    name: string,
    titleName: string
  ) {
    const importPath = path.replace('src/addon/', './').replace('.ts', '');
    const exportPath = importPath.replace('./', './addon/');
    const alternatedExportPath = exportPath + '.server';
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve('src', 'public-api.ts'),
      content => content + `\nexport * from '${alternatedExportPath}';`
    );
    // src/addon/index.ts
    return this.fileService.changeContent(
      resolve('src', 'addon', 'index.ts'),
      content => {
        content = content
          // menu item
          .replace(
            ".addItem('Help', 'helpSidebar')",
            [
              `.addItem('${titleName}', '${name}Modal')`,
              "      .addItem('Help', 'helpSidebar')",
            ].join('\n')
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
              `import {${className}} from '${importPath}';`,
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
              `import {${className}} from '${importPath}';`,
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
}
