import {resolve} from 'path';
import {yellow, green} from 'chalk';
import {CreateService, CreateType} from '../../public-api';

export class NewCommand {
  constructor(private createService: CreateService) {}

  run(type: CreateType, name: string, description: string) {
    const path = resolve(name);
    description = description || 'A Seminjecto project.';
    // create
    if (type === 'lib') {
      this.createService.createLib(path, description);
    } else if (type === 'cli') {
      this.createService.createCli(path, description);
    } else if (type === 'express') {
      this.createService.createExpress(path, description);
    }
    // result
    console.log(`Create a new ${yellow(type)} project:`, green(name));
  }
}
