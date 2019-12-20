import { red } from 'chalk';
import * as commander from 'commander';
import { SeminjectoModule } from '../public-api';

import { NewCommand } from './commands/new';
import { GenerateCommand } from './commands/generate';

export class Cli {
  private seminjectoModule: SeminjectoModule;

  newCommand: NewCommand;
  generateCommand: GenerateCommand;

  commander = ['semidi', 'Simple dependency injection for Typescript modules.'];

  /**
   * @params <name> - The project name
   * @params [description] - The project description
   */
  newCommandDef: CommandDef = [
    'new <name> [description]',
    'Create a new project.',
    ['-x, --cli', 'Create a CLI project.']
  ];

  /**
   * @params <type> - The resource type
   * @params <dest> - The resource destination
   */
  generateCommandDef: CommandDef = [
    'generate <type> <dest>',
    'Generate a resource.'
  ];

  constructor() {
    this.seminjectoModule = new SeminjectoModule();
    // commands
    this.newCommand = new NewCommand(this.seminjectoModule.createService);
    this.generateCommand = new GenerateCommand(
      this.seminjectoModule.generateService
    );
  }

  getApp() {
    const [command, description] = this.commander;
    commander
      .version(require('../../package.json').version, '-v, --version')
      .usage(`${command} [options] [command]`)
      .description(description);

    // new
    (() => {
      const [command, description, cliOpt] = this.newCommandDef;
      commander
        .command(command)
        .description(description)
        .option(...cliOpt) // -x, --cli
        .action((name, description, options) =>
          this.newCommand.run(name, description, options)
        );
    })();

    // generate
    (() => {
      const [command, description] = this.generateCommandDef;
      commander
        .command(command)
        .description(description)
        .action((type, dest) => this.generateCommand.run(type, dest));
    })();

    // help
    commander
      .command('help')
      .description('Display help.')
      .action(() => commander.outputHelp());

    // *
    commander
      .command('*')
      .description('Any other command is not supported.')
      .action((cmd: string) => console.error(red(`Unknown command '${cmd}'`)));

    return commander;
  }
}

type CommandDef = [string, string, ...Array<[string, string]>];
