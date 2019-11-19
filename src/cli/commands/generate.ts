import { outputFile } from 'fs-extra';
import chalk from 'chalk';

import { GenerateService, GenerateType } from '../../public-api';

export class GenerateCommand {

  constructor(private generateService: GenerateService) {}

  async run(type: GenerateType, dest: string) {
    const { content, path, fullPath } = this.generateService.generate(type, dest);
    // save the file
    await outputFile(fullPath, content);
    // show result
    return console.log('File saved: ', chalk.green(path));
  }

}