import {resolve} from 'path';
import {camelCase, capitalCase, pascalCase} from 'change-case';

import {FileService} from './file.service';
import {DownloadService} from './download.service';

export type CreateType = 'lib' | 'cli' | 'express' | 'sheetbase' | 'workspace';

export class CreateService {
  constructor(
    private fileService: FileService,
    private downloadService: DownloadService
  ) {}

  proccessInput(input: string) {
    // direct url
    if (input.endsWith('.zip') || input.startsWith('http')) {
      return input;
    }
    // custom github
    else if (input.indexOf('/') !== -1) {
      const [pkg, tag = 'latest'] = input.split('@');
      return `https://github.com/${pkg}/archive/${tag}.zip`;
    }
    // lamnhan github
    else {
      const [type, tag = 'latest'] = input.split('@');
      return `https://github.com/lamnhan/seminjecto-${type}/archive/${tag}.zip`;
    }
  }

  async create(
    resourceUrl: string,
    type: string,
    dest: string,
    description: string
  ) {
    await this.downloadService.downloadAndUnzip(
      resourceUrl,
      dest + '/download.zip'
    );
    return this.modifyContent(type, dest, description);
  }

  private async modifyContent(type: string, dest: string, description: string) {
    const name = dest.replace(/\\/g, '/').split('/').pop() as string;
    const nameCamel = camelCase(name);
    const nameCamelLite = nameCamel.replace(/_/g, '');
    const namePascal = pascalCase(name);
    const namePascalLite = namePascal.replace(/_/g, '');
    const nameCapital = capitalCase(name);
    // LIB
    if (type === 'lib') {
      // src/public-api.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'public-api.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`,
        }
      );
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "lib"': `: "${name}"`,
        'A Seminjecto project.': description,
      });
    }
    // CLI
    else if (type === 'cli') {
      // src/public-api.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'public-api.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`,
          '{Cli as LibCliModule}': `{Cli as ${namePascalLite}CliModule}`,
        }
      );
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
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`, // import {...}
          "'cli'": `'${name}'`,
          "'A Seminjecto project.'": `'${description}'`,
          'libModule: LibModule': `${nameCamelLite}Module: ${namePascalLite}Module`, // private ...
          'this.libModule': `this.${nameCamelLite}Module`,
          'new LibModule': `new ${namePascalLite}Module`,
        }
      );
    }
    // EXPRESS
    if (type === 'express') {
      // src/public-api.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'public-api.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`,
          '{App as LibAppModule}': `{App as ${namePascalLite}AppModule}`,
        }
      );
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "app"': `: "${name}"`,
        'A Seminjecto project.': description,
      });
      // src/app/index.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'app', 'index.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`, // import {...}
          'libModule: LibModule': `${nameCamelLite}Module: ${namePascalLite}Module`, // private ...
          'this.libModule': `this.${nameCamelLite}Module`,
          'new LibModule': `new ${namePascalLite}Module`,
        }
      );
    }
    // SHEETBASE
    if (type === 'sheetbase') {
      // src/public-api.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'public-api.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`,
          '{App as LibAppModule}': `{App as ${namePascalLite}AppModule}`,
        }
      );
      // package.json
      await this.fileService.changeContent(resolve(dest, 'package.json'), {
        ': "app"': `: "@app/${name}"`,
        'A Seminjecto project.': description,
      });
      // src/app/index.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'app', 'index.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`, // import {...}
          'libModule: LibModule': `${nameCamelLite}Module: ${namePascalLite}Module`, // private ...
          'this.libModule': `this.${nameCamelLite}Module`,
          'new LibModule': `new ${namePascalLite}Module`,
        }
      );
    }
    // WORKSPACE
    if (type === 'workspace') {
      // src/public-api.ts
      await this.fileService.changeContent(
        resolve(dest, 'src', 'public-api.ts'),
        {
          '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`,
          '{Addon as LibAddonModule}': `{Addon as ${namePascalLite}AddonModule}`,
        }
      );
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
    // ANY
    else {
      // src/public-api.ts
      const typeCapital = capitalCase(type);
      const publicApiReplaces = {
        '{Lib as LibModule}': `{Lib as ${namePascalLite}Module}`,
      } as Record<string, string>;
      publicApiReplaces[
        `{${typeCapital} as Lib${typeCapital}Module}`
      ] = `{${typeCapital} as ${namePascalLite}${typeCapital}Module}`;
      await this.fileService.changeContent(
        resolve(dest, 'src', 'public-api.ts'),
        publicApiReplaces
      );
    }
  }
}
