import { resolve } from 'path';
import { yellow, green } from 'chalk';
import { CreateService } from '../../public-api';

export interface NewCommandOptions {
  cli: boolean;
}

export class NewCommand {
  constructor(private createService: CreateService) {}

  run(name: string, description: string, { cli }: NewCommandOptions) {
    const path = resolve(name);
    description = description || 'A Seminjecto project.';
    // create
    if (cli) {
      this.createService.createCli(path, description);
    } else {
      this.createService.createLib(path, description);
    }
    // result
    console.log(
      `Create a new ${yellow(cli ? 'cli' : 'lib')} project:`,
      green(name)
    );
  }
}
