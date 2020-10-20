import {resolve} from 'path';
import {gray, red, green} from 'chalk';
import {pathExists, remove} from 'fs-extra';
import {prompt} from 'inquirer';

import {FileService} from '../../lib/services/file.service';

interface CleanOptions {
  skipQuestion?: boolean;
  list?: boolean;
  includes?: string;
  excludes?: string;
}

export class CleanCommand {
  constructor(private fileService: FileService) {}

  async run(cmdOptions: CleanOptions) {
    const includes = cmdOptions.includes
      ? this.processInputPaths(cmdOptions.includes)
      : [];
    const excludes = cmdOptions.excludes
      ? this.processInputPaths(cmdOptions.excludes)
      : [];
    // process files
    const srcFiles = await this.fileService.readFiles('src');
    const testFiles = await this.fileService.readFiles('test');
    const files = [...srcFiles, ...testFiles]
      .map(path => path.replace(/\\/g, '/'))
      .filter(
        path =>
          (path.indexOf('.ts') === -1 || path.indexOf('.d.ts') !== -1) &&
          excludes.indexOf(path) === -1
      )
      .concat(...includes);
    // show file list
    if (cmdOptions.list) {
      console.log('Files for removal:');
      files.forEach(path => console.log(red(path)));
    }
    // question
    const yes = await (async () => {
      if (!cmdOptions.skipQuestion) {
        const answer = await prompt([
          {
            type: 'input',
            name: 'ok',
            message:
              `Clean output files (add ${green('-l')} for the list). ` +
              gray('[y/N]'),
          },
        ]);
        return answer.ok === 'y';
      } else {
        return true;
      }
    })();
    if (yes) {
      let fileNumber = 0;
      for (let i = 0; i < files.length; i++) {
        const path = resolve(files[i]);
        if (await pathExists(path)) {
          await remove(path);
          fileNumber++;
        }
      }
      console.log('Remove ' + fileNumber + ' files.');
    } else {
      console.log('No file removed.');
    }
  }

  private processInputPaths(input: string) {
    return input
      .split('|')
      .map(path =>
        path.trim().replace('./', '').replace('.\\', '').replace(/\\/g, '/')
      );
  }
}
