import {yellow, green} from 'chalk';
import {outputFile, pathExists} from 'fs-extra';

import {GenerateService} from '../../lib/services/generate.service';

export class GenerateCommand {
  constructor(private generateService: GenerateService) {}

  async run(type: string, dest: string) {
    const {content, path, fullPath} = this.generateService.generate(type, dest);
    if (await pathExists(fullPath)) {
      return console.log(
        `A ${yellow(type)} already available at ` + green(path)
      );
    } else {
      // save the file
      await outputFile(fullPath, content);
      // modify
      await this.generateService.modify(type, path);
      // show result
      return console.log(`New ${yellow(type)} saved at ` + green(path));
    }
  }
}
