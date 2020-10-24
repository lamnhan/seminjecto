import {execSync} from 'child_process';
import {resolve} from 'path';
import {yellow, green, gray} from 'chalk';

import {FileService} from '../../lib/services/file.service';
import {CreateService} from '../../lib/services/create.service';

interface NewCommandOptions {
  source?: string;
  skipGit?: boolean;
  skipInstall?: boolean;
}

export class NewCommand {
  constructor(
    private fileService: FileService,
    private createService: CreateService
  ) {}

  async run(
    type: string,
    name: string,
    description: string,
    commandOptions: NewCommandOptions
  ) {
    const url = this.createService.proccessInput(commandOptions.source || type);
    const validName = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, ' ')
      .replace(/ /g, '-');
    const path = resolve(validName);
    description = description || 'A Seminjecto project.';
    // create
    await this.createService.create(url, type, path, description);
    // show list of files
    const files = await this.fileService.readFiles(path);
    console.log(`Create a new ${yellow(type)} project:`, green(validName));
    console.log('From: ' + gray(url));
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
