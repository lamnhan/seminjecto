import {resolve} from 'path';

interface Template {
  path: string;
  fullPath: string;
  content: string;
}

export class GenerateService {
  constructor() {}

  generate(type: string, dest: string, nested = false) {
    const templates: Template[] = [];
    // process
    const isNested = nested ? nested : type === 'sidebar' || type === 'modal';
    const part =
      type === 'sidebar' || type === 'modal'
        ? 'addon'
        : type === 'route'
        ? 'app'
        : type === 'command'
        ? 'cli'
        : 'lib';
    const destPaths = dest.split('/');
    const name = (destPaths.pop() as string).split('.')[0].toLowerCase();
    const titleName = name.charAt(0).toUpperCase() + name.substr(1);
    // special sidebar & modal
    if (type === 'sidebar' || type === 'modal') {
      // .ts
      const {path: tsPath, fullPath: tsFullPath} = this.buildPath(
        name,
        type,
        part,
        destPaths,
        isNested,
        'ts'
      );
      const tsContent = this.buildSidebarOrModalTsContent();
      const mainTemplate = {
        path: tsPath,
        fullPath: tsFullPath,
        content: tsContent,
      };
      templates.push(mainTemplate);
      // .html
      const {path: htmlPath, fullPath: htmlFullPath} = this.buildPath(
        name,
        type,
        part,
        destPaths,
        isNested,
        'html'
      );
      const htmlContent = this.buildSidebarOrModalHtmlContent();
      const htmlTemplate = {
        path: htmlPath,
        fullPath: htmlFullPath,
        content: htmlContent,
      };
      templates.push(htmlTemplate);
      // .scss
      const {path: scssPath, fullPath: scssFullPath} = this.buildPath(
        name,
        type,
        part,
        destPaths,
        isNested,
        'scss'
      );
      const scssContent = this.buildSidebarOrModalScssContent();
      const scssTemplate = {
        path: scssPath,
        fullPath: scssFullPath,
        content: scssContent,
      };
      templates.push(scssTemplate);
      // .server.ts
      const {path: serverPath, fullPath: serverFullPath} = this.buildPath(
        name,
        type,
        part,
        destPaths,
        isNested,
        'ts',
        'server'
      );
      const serverContent = this.buildSidebarOrModalServerContent(
        type,
        name,
        titleName
      );
      const serverTemplate = {
        path: serverPath,
        fullPath: serverFullPath,
        content: serverContent,
      };
      templates.push(serverTemplate);
    }
    // other class-based types
    else {
      const mainBody: string[] =
        type === 'command'
          ? ['run() {}']
          : type === 'route'
          ? ['get() {}']
          : [];
      const {path: mainPath, fullPath: mainFullPath} = this.buildPath(
        name,
        type,
        part,
        destPaths,
        isNested,
        'ts'
      );
      const mainContent = this.buildMainContent(type, name, mainBody);
      const mainTemplate = {
        path: mainPath,
        fullPath: mainFullPath,
        content: mainContent,
      };
      templates.push(mainTemplate);
    }
    // result
    return templates;
  }

  private buildPath(
    name: string,
    type: string,
    part = 'lib',
    destPaths: string[] = [],
    nested = false,
    ext = 'ts',
    extPrefix?: string
  ) {
    if (nested) {
      destPaths.push(name);
    }
    const path = [
      'src',
      part,
      ...destPaths,
      `${name}.${type}.${extPrefix ? extPrefix + '.' : ''}${ext}`,
    ].join('/');
    const fullPath = resolve(path);
    return {path, fullPath};
  }

  private buildMainContent(type: string, name: string, body: string[]) {
    const className = name.charAt(0).toUpperCase() + name.substr(1);
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
    return content;
  }

  private buildSidebarOrModalTsContent() {
    const content = [
      'function todo() {',
      "  return 'Add client logic.';",
      '}',
    ].join('\n');
    return content;
  }

  private buildSidebarOrModalHtmlContent() {
    const content = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>Title</title>',
      '  <base target="_blank">',
      '</head>',
      '<body>',
      '  <p>Content here.</p>',
      '</body>',
      '</html>',
    ].join('\n');
    return content;
  }

  private buildSidebarOrModalScssContent() {
    const content = ['p {', '  color: #000;', '}'].join('\n');
    return content;
  }

  private buildSidebarOrModalServerContent(
    type: string,
    name: string,
    titleName: string
  ) {
    const content = [
      ...(type === 'sidebar'
        ? [
            `export function ${name}Sidebar() {`,
            '  return SpreadsheetApp.getUi().showSidebar(',
            `    HtmlService.createHtmlOutputFromFile('${titleName}Sidebar').setTitle('${titleName}')`,
            '  );',
            '}',
          ]
        : [
            `export function ${name}Modal() {`,
            '  return SpreadsheetApp.getUi().showModalDialog(',
            `    HtmlService.createHtmlOutputFromFile('${titleName}Sidebar').setWidth(720).setHeight(480),`,
            `    '${titleName}'`,
            '  );',
            '}',
          ]),
      '',
      'export function todo() {',
      "  return 'Add server logic.';",
      '}',
    ].join('\n');
    return content;
  }
}
