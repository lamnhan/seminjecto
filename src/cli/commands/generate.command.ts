import {yellow, green} from 'chalk';
import {outputFile, pathExists} from 'fs-extra';

import {GenerateService} from '../../lib/services/generate.service';
import {ModifyService} from '../../lib/services/modify.service';

export class GenerateCommand {
  constructor(
    private generateService: GenerateService,
    private modifyService: ModifyService
  ) {}

  async run(type: string, dest: string, nested: boolean) {
    const templates = this.generateService.generate(type, dest, nested);
    const {path: mainPath, fullPath: mainFullPath} = templates[0];
    if (await pathExists(mainFullPath)) {
      console.log(`A ${yellow(type)} already available at ` + green(mainPath));
    } else {
      // save files
      for (let i = 0; i < templates.length; i++) {
        const {path, fullPath, content} = templates[i];
        // save the file
        await outputFile(fullPath, content);
        // show result
        console.log(`New ${yellow(type)} saved at ` + green(path));
      }
      // modify
      await this.modifyService.modify(type, mainPath);
    }
  }
}
