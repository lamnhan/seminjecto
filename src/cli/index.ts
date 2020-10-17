import {red} from 'chalk';
import {Command} from 'commander';
import {Lib as SeminjectoModule} from '../lib/index';

import {NewCommand} from './commands/new.command';
import {GenerateCommand} from './commands/generate.command';

export class Cli {
  private seminjectoModule: SeminjectoModule;
  newCommand: NewCommand;
  generateCommand: GenerateCommand;

  commander = ['semidi', 'Simple dependency injection for Typescript modules.'];

  /**
   * @params <type> - The project type: lib, cli, app, ...
   * @params <name> - The project name
   * @params [description] - The project description
   */
  newCommandDef: CommandDef = [
    'new <type> <name> [description]',
    'Create a new project.',
  ];

  /**
   * @params <type> - The resource type
   * @params <dest> - The resource destination
   */
  generateCommandDef: CommandDef = [
    'generate <type> <dest>',
    'Generate a resource.',
    ['-n, --nested', 'Nested under a folder.'],
  ];

  constructor() {
    this.seminjectoModule = new SeminjectoModule();
    // commands
    this.newCommand = new NewCommand(this.seminjectoModule.createService);
    this.generateCommand = new GenerateCommand(
      this.seminjectoModule.generateService,
      this.seminjectoModule.modifyService
    );
  }

  getApp() {
    const commander = new Command();

    // general
    const [command, description] = this.commander;
    commander
      .version(require('../../package.json').version, '-v, --version')
      .name(`${command}`)
      .usage('[options] [command]')
      .description(description);

    // new
    (() => {
      const [command, description] = this.newCommandDef;
      commander
        .command(command)
        .description(description)
        .action((type, name, description) =>
          this.newCommand.run(type, name, description)
        );
    })();

    // generate
    (() => {
      const [command, description, nestedOpt] = this.generateCommandDef;
      commander
        .command(command)
        .alias('g')
        .description(description)
        .option(...nestedOpt) // -n, --nested
        .action((type, dest, {nested}) =>
          this.generateCommand.run(type, dest, nested)
        );
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
      .action(cmd => console.error(red(`Unknown command '${cmd.args[0]}'`)));

    return commander;
  }
}

type CommandDef = [string, string, ...Array<[string, string]>];
