import {execSync} from 'child_process';
import {resolve} from 'path';
import {yellow, green, red} from 'chalk';

import {FileService} from '../../lib/services/file.service';
import {CreateService, CreateType} from '../../lib/services/create.service';

interface NewCommandOptions {
  skipGit?: boolean;
  skipInstall?: boolean;
}

export class NewCommand {
  constructor(
    private fileService: FileService,
    private createService: CreateService
  ) {}

  async run(
    type: CreateType,
    name: string,
    description: string,
    commandOptions: NewCommandOptions
  ) {
    const path = resolve(name);
    description = description || 'A Seminjecto project.';
    // create
    switch (type) {
      case 'lib':
        await this.createService.createLib(path, description);
        break;
      case 'cli':
        await this.createService.createCli(path, description);
        break;
      case 'express':
        await this.createService.createExpress(path, description);
        break;
      case 'sheetbase':
        await this.createService.createSheetbase(path, description);
        break;
      case 'workspace':
        await this.createService.createWorkspace(path, description);
        break;
      default:
        throw new Error('Not supported project type: ' + red(type));
    }
    // result
    const files = await this.fileService.readFiles(path);
    console.log(`Create a new ${yellow(type)} project:`, green(name));
    files.forEach(file =>
      console.log(file.replace(path, '').replace(/\\/g, '/').substr(1))
    );
    // install dependencies
    if (!commandOptions.skipInstall) {
      execSync('npm install', {stdio: 'inherit', cwd: path});
    }
    // init git
    if (!commandOptions.skipGit) {
      execSync('git init', {stdio: 'inherit', cwd: path});
    }
  }
}
