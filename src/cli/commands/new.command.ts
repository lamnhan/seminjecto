import {execSync} from 'child_process';
import {resolve} from 'path';
import {yellow, green, red} from 'chalk';

import {FileService} from '../../lib/services/file.service';
import {CreateService, CreateType} from '../../lib/services/create.service';

interface NewOptions {
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
    cmdOptions: NewOptions
  ) {
    const path = resolve(name);
    description = description || 'A Seminjecto project.';
    // create
    switch (type) {
      case 'lib':
        this.createService.createLib(path, description);
        break;
      case 'cli':
        this.createService.createCli(path, description);
        break;
      case 'express':
        this.createService.createExpress(path, description);
        break;
      case 'sheetbase':
        this.createService.createSheetbase(path, description);
        break;
      case 'workspace':
        this.createService.createWorkspace(path, description);
        break;
      default:
        throw new Error('Not supported project type: ' + red(type));
    }
    // result
    const files = await this.fileService.readFiles(path);
    console.log(`Create a new ${yellow(type)} project:`, green(name));
    files.forEach(file => console.log(file));
    // install dependencies
    if (!cmdOptions.skipInstall) {
      execSync('npm install', {stdio: 'inherit', cwd: path});
    }
    // init git
    if (!cmdOptions.skipGit) {
      execSync('git init', {stdio: 'inherit', cwd: path});
    }
  }
}
