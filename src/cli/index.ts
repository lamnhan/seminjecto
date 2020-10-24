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
   * @param type - The project type: lib, cli, sheetbase, ... or {any}.
   * @param name - The project name.
   * @param description? - The project description.
   */
  newCommandDef: CommandDef = [
    ['new <type> <name> [description]', 'start', 'n'],
    'Create a new project.',
    [
      '-s, --source [value]',
      'Custom source: {inner_repo}@{tag}, {org}/{repo}, {org}/{repo}@{tag} or url.',
    ],
    ['-i, --skip-install', 'Does not install dependency packages.'],
    ['-g, --skip-git', 'Does not initialize a git repository.'],
  ];

  /**
   * @param type - The resource type
   * @param dest - The resource destination
   */
  generateCommandDef: CommandDef = [
    ['generate <type> <dest>', 'create', 'g'],
    'Generate a resource.',
    ['-n, --nested', 'Nested under a folder.'],
    ['-t, --typing', 'Save typing file.'],
  ];

  cleanCommandDef: CommandDef = [
    ['clean', 'c'],
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
        [command, ...aliases],
        description,
        sourceOpt,
        skipInstallOpt,
        skipGitOpt,
      ] = this.newCommandDef;
      commander
        .command(command)
        .aliases(aliases)
        .description(description)
        .option(...sourceOpt)
        .option(...skipInstallOpt)
        .option(...skipGitOpt)
        .action((type, name, description, options) =>
          this.newCommand.run(type, name, description, options)
        );
    })();

    // generate
    (() => {
      const [
        [command, ...aliases],
        description,
        nestedOpt,
        typingOpt,
      ] = this.generateCommandDef;
      commander
        .command(command)
        .aliases(aliases)
        .description(description)
        .option(...nestedOpt)
        .option(...typingOpt)
        .action((type, dest, options) =>
          this.generateCommand.run(type, dest, options)
        );
    })();

    // clean
    (() => {
      const [
        [command, ...aliases],
        description,
        skipQuestionOpt,
        listOpt,
        includesOpt,
        excludesOpt,
      ] = this.cleanCommandDef;
      commander
        .command(command)
        .aliases(aliases)
        .description(description)
        .option(...skipQuestionOpt)
        .option(...listOpt)
        .option(...includesOpt)
        .option(...excludesOpt)
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

type CommandDef = [string | string[], string, ...Array<[string, string]>];
