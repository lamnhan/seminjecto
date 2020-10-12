import {resolve} from 'path';
import {yellow, green, red} from 'chalk';

import {CreateService, CreateType} from '../../lib/services/create.service';

export class NewCommand {
  constructor(private createService: CreateService) {}

  run(type: CreateType, name: string, description: string) {
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
    console.log(`Create a new ${yellow(type)} project:`, green(name));
  }
}
