import { resolve } from 'path';

import { CreateService } from '../../public-api';

export interface NewCommandOptions {
  cli: boolean;
}

export class NewCommand {

  constructor(private createService: CreateService) {}

  run(name: string, { cli }: NewCommandOptions) {
    const path = resolve(name);
    if (cli) {
      this.createService.createCli(path);
    } else {
      this.createService.createLib(path);
    }
    console.log('Create new project: ', name);
  }

}