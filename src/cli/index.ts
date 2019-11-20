import chalk from 'chalk';
import * as commander from 'commander';
import { SeminjectoModule, CommandDef } from '../public-api';

import { NewCommand } from './commands/new';
import { GenerateCommand } from './commands/generate';

export class Cli {
  private seminjectoModule: SeminjectoModule;

  private newCommand: NewCommand;
  private generateCommand: GenerateCommand;

  commander = ['semidi', 'Simple dependency injection for Typescript modules.'];

  /**
   * @params <name> - The project name
   * @params [description] - The project description
   */
  newCommandDef: CommandDef = [
    'new <name> [description]',
    'Create a new project.',
    ['-c, --cli', 'Create a CLI project.']
  ];

  /**
   * @params <type> - The resource type
   * @params <dest> - The resource destination
   */
  generateCommandDef: CommandDef = [
    'generate <type> <dest>', 'Generate a resource.'
  ];

  constructor() {
    this.seminjectoModule = new SeminjectoModule();
    // commands
    this.newCommand = new NewCommand(
      this.seminjectoModule.Create
    );
    this.generateCommand = new GenerateCommand(
      this.seminjectoModule.Generate,
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
      const [ command, description, cliOpt ] = this.newCommandDef;
      commander
        .command(command)
        .description(description)
        .option(...cliOpt) // -c, --cli
        .action((name, description, options) => this.newCommand.run(name, description, options));
    })();

    // generate
    (() => {
      const [ command, description ] = this.generateCommandDef;
      commander
        .command(command)
        .description(description)
        .action((type, dest) => this.generateCommand.run(type, dest));
    })();

    commander
      .command('help')
      .description('Display help.')
      .action(() => commander.outputHelp());

    commander
      .command('*')
      .description('Any other command is not supported.')
      .action((cmd: string) =>
        console.error(chalk.red(`Unknown command '${cmd}'`))
      );

    return commander;
  }

}