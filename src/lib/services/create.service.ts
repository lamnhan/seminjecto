import {resolve} from 'path';
import axios from 'axios';
import {camelCase, capitalCase, pascalCase} from 'change-case';

import {FileService} from './file.service';
import {DownloadService} from './download.service';

export type CreateType = 'lib' | 'cli' | 'express' | 'sheetbase' | 'workspace';

export class CreateService {
  constructor(
    private fileService: FileService,
    private downloadService: DownloadService
  ) {}

  async createLib(dest: string, description: string) {
    return this.create('lib', dest, description);
  }

  async createCli(dest: string, description: string) {
    return this.create('cli', dest, description);
  }

  async createExpress(dest: string, description: string) {
    return this.create('express', dest, description);
  }

  async createSheetbase(dest: string, description: string) {
    return this.create('sheetbase', dest, description);
  }

  async createWorkspace(dest: string, description: string) {
    return this.create('workspace', dest, description);
  }

  private async create(type: CreateType, dest: string, description: string) {
    const url = await this.resolveLatestRelease('lamnhan/seminjecto-' + type);
    const filePath = dest + '/download.zip';
    await this.downloadService.downloadAndUnzip(url, filePath);
    // modify content
    const name = (dest.replace(/\\/g, '/').split('/').pop() as string)
      .toLowerCase()
      .replace(/[^a-zA-Z-]/g, ' ')
      .replace(/ /g, '-');
    const nameCamel = camelCase(name);
    const namePascal = pascalCase(name);
    const nameCapital = capitalCase(name);
    await this.modifyContent(
      type,
      dest,
      name,
      nameCamel,
      namePascal,
      nameCapital,
      description
    );
  }

  private async modifyContent(
    type: CreateType,
    dest: string,
    name: string,
    nameCamel: string,
    namePascal: string,
    nameCapital: string,
    description: string
  ) {
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve(dest, 'src', 'public-api.ts'),
      {
        '{Lib as LibModule}': `{Lib as ${namePascal}Module}`,
        '{Cli as LibCliModule}': `{Cli as ${namePascal}CliModule}`,
        '{App as LibAppModule}': `{App as ${namePascal}AppModule}`,
      }
    );
    // LIB
    if (type === 'lib') {
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "lib"': `: "${name}"`,
        'A Seminjecto project.': description,
      });
    }
    // CLI
    else if (type === 'cli') {
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "cli"': `: "${name}"`,
        'A Seminjecto project.': description,
        '"cli":': `"${name}":`,
      });
      // src/cli/index.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'cli', 'index.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascal}Module}`, // import {...}
          "'cli'": `'${name}'`,
          "'A Seminjecto project.'": `'${description}'`,
          'libModule: LibModule': `${nameCamel}Module: ${namePascal}Module`, // private ...
          'this.libModule': `this.${nameCamel}Module`,
          'new LibModule': `new ${namePascal}Module`,
        }
      );
    }
    // EXPRESS
    if (type === 'express') {
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "app"': `: "${name}"`,
        'A Seminjecto project.': description,
      });
      // src/app/index.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'app', 'index.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascal}Module}`, // import {...}
          'libModule: LibModule': `${nameCamel}Module: ${namePascal}Module`, // private ...
          'this.libModule': `this.${nameCamel}Module`,
          'new LibModule': `new ${namePascal}Module`,
        }
      );
    }
    // SHEETBASE
    if (type === 'sheetbase') {
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "app"': `: "@app/${name}"`,
        'A Seminjecto project.': description,
      });
      // src/app/index.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'app', 'index.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascal}Module}`, // import {...}
          'libModule: LibModule': `${nameCamel}Module: ${namePascal}Module`, // private ...
          'this.libModule': `this.${nameCamel}Module`,
          'new LibModule': `new ${namePascal}Module`,
        }
      );
    }
    // WORKSPACE
    if (type === 'workspace') {
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "addon"': `: "${name}"`,
        'A Seminjecto project.': description,
      });
      // src/addon/index.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'addon', 'index.ts'),
        {
          "createMenu('Addon')": `createMenu('${nameCapital}')`,
        }
      );
    }
  }

  private async resolveLatestRelease(pkg: string) {
    const {data} = await axios({
      method: 'GET',
      url: `https://api.github.com/repos/${pkg}/releases/latest`,
    });
    const name = pkg;
    const version = data.name;
    return `https://github.com/${name}/archive/${version}.zip`;
  }
}
