export interface NewCommandOptions {
  cli: boolean;
}

export class NewCommand {

  constructor() {}

  run(name: string, options: NewCommandOptions) {
    console.log('Create new project: ', name);
  }

}