import {yellow, green} from 'chalk';
import {outputFile, pathExists} from 'fs-extra';

import {GenerateService} from '../../lib/services/generate.service';
import {ModifyService} from '../../lib/services/modify.service';

interface GenerateOptions {
  nested?: boolean;
}

export class GenerateCommand {
  constructor(
    private generateService: GenerateService,
    private modifyService: ModifyService
  ) {}

  async run(type: string, dest: string, cmdOptions: GenerateOptions) {
    const templates = this.generateService.generate(
      type,
      dest,
      cmdOptions.nested
    );
    const {path: mainPath, fullPath: mainFullPath} = templates[0];
    if (await pathExists(mainFullPath)) {
      console.log(`A ${yellow(type)} already available at ` + green(mainPath));
    } else {
      // save files
      for (let i = 0; i < templates.length; i++) {
        const {path, fullPath, content} = templates[i];
        await outputFile(fullPath, content);
        console.log('CREATE ' + green(path));
      }
      // modify
      await this.modifyService.modify(type, mainPath);
      if (type === 'sidebar' || type === 'modal') {
        console.log('MODIFY src/addon/index.ts');
      } else if (type === 'command') {
        console.log('MODIFY src/cli/index.ts');
      } else if (type === 'route') {
        console.log('MODIFY src/app/index.ts');
      } else {
        console.log('MODIFY src/lib/index.ts');
      }
      console.log('MODIFY src/public-api.ts');
    }
  }
}
