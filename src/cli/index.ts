import {red} from 'chalk';
import {Command} from 'commander';
import {Lib as SeminjectoModule} from '../lib/index';

import {NewCommand} from './commands/new.command';
import {GenerateCommand} from './commands/generate.command';
import {CleanCommand} from './commands/clean.command';

export class Cli {
  private seminjectoModule: SeminjectoModule;
  newCommand: NewCommand;
  generateCommand: GenerateCommand;
  cleanCommand: CleanCommand;

  commander = ['semidi', 'Simple dependency injection for Typescript modules.'];

  /**
   * @params <type> - The project type: lib, cli, app, ...
   * @params <name> - The project name
   * @params [description] - The project description
   */
  newCommandDef: CommandDef = [
    'new <type> <name> [description]',
    'Create a new project.',
    ['-i, --skip-install', 'Does not install dependency packages.'],
    ['-g, --skip-git', 'Does not initialize a git repository.'],
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

  cleanCommandDef: CommandDef = [
    'clean',
    'Clean typescript output files.',
    ['-y, --skip-question', 'Does not ask question.'],
    ['-l, --list', 'Show list of files.'],
    ['-i, --includes [value]', 'Including files, separated by `|`.'],
    ['-e, --excludes [value]', 'Excluding files, separated by `|`.'],
  ];

  constructor() {
    this.seminjectoModule = new SeminjectoModule();
    // commands
    this.newCommand = new NewCommand(
      this.seminjectoModule.fileService,
      this.seminjectoModule.createService
    );
    this.generateCommand = new GenerateCommand(
      this.seminjectoModule.generateService,
      this.seminjectoModule.modifyService
    );
    this.cleanCommand = new CleanCommand(this.seminjectoModule.fileService);
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
      const [
        command,
        description,
        skipInstallOpt,
        skipGitOpt,
      ] = this.newCommandDef;
      commander
        .command(command)
        .alias('n')
        .description(description)
        .option(...skipInstallOpt) // --skip-install
        .option(...skipGitOpt) // --skip-git
        .action((type, name, description, options) =>
          this.newCommand.run(type, name, description, options)
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
        .action((type, dest, options) =>
          this.generateCommand.run(type, dest, options)
        );
    })();

    // clean
    (() => {
      const [
        command,
        description,
        skipQuestionOpt,
        listOpt,
        includesOpt,
        excludesOpt,
      ] = this.cleanCommandDef;
      commander
        .command(command)
        .description(description)
        .option(...skipQuestionOpt) // -y, --skip-question
        .option(...listOpt) // -l, --list
        .option(...includesOpt) // -i, --includes
        .option(...excludesOpt) // -e, --excludes
        .action(options => this.cleanCommand.run(options));
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
