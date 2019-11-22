import { outputFile, pathExists } from 'fs-extra';
import chalk from 'chalk';

import { GenerateService, GenerateType } from '../../public-api';

export class GenerateCommand {

  constructor(private generateService: GenerateService) {}

  async run(type: GenerateType, dest: string) {
    const { content, path, fullPath } = this.generateService.generate(type, dest);
    if (await pathExists(fullPath)) {
      return console.log(`A ${chalk.yellow(type)} already available at ` + chalk.green(path));
    } else {
      // save the file
      await outputFile(fullPath, content);
      // modify
      await this.generateService.modify(type, path);
      // show result
      return console.log(`New ${chalk.yellow(type)} saved at ` + chalk.green(path));
    }
  }

}