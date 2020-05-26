import {resolve} from 'path';
import axios from 'axios';

import {FileService} from './file.service';
import {DownloadService} from './download.service';

export type CreateType = 'lib' | 'cli' | 'express';

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

  private async create(type: CreateType, dest: string, description: string) {
    const url = await this.resolveLatestRelease('lamnhan/seminjecto-' + type);
    const filePath = dest + '/download.zip';
    await this.downloadService.downloadAndUnzip(url, filePath);
    // modify content
    const name = (dest.replace(/\\/g, '/').split('/').pop() as string)
      .toLowerCase()
      .replace(/[\W_]+/g, '');
    const titleName = name.charAt(0).toUpperCase() + name.substr(1);
    await this.modifyContent(type, dest, name, titleName, description);
  }

  private async modifyContent(
    type: CreateType,
    dest: string,
    name: string,
    titleName: string,
    description: string
  ) {
    // src/public-api.ts
    await this.fileService.changeContent(
      resolve(dest, 'src', 'public-api.ts'),
      {
        '{ Lib as LibModule }': `{ Lib as ${titleName}Module }`,
        '{ Cli as LibCliModule }': `{ Cli as ${titleName}CliModule }`,
        '{ App as LibAppModule }': `{ App as ${titleName}AppModule }`,
      }
    );
    // LIB only
    if (type === 'lib') {
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "lib"': `: "${name}"`,
        'A Seminjecto project.': description,
      });
    }
    // CLI only
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
          '{ LibModule }': `{ ${titleName}Module }`, // import {...}
          "'cli'": `'${name}'`,
          "'A Seminjecto project.'": `'${description}'`,
          'libModule: LibModule': `${name}Module: ${titleName}Module`, // private ...
          'this.libModule': `this.${name}Module`,
          'new LibModule': `new ${titleName}Module`,
        }
      );
    }
    // EXPRESS only
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
          '{ LibModule }': `{ ${titleName}Module }`, // import {...}
          'libModule: LibModule': `${name}Module: ${titleName}Module`, // private ...
          'this.libModule': `this.${name}Module`,
          'new LibModule': `new ${titleName}Module`,
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
