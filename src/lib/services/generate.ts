import { EOL } from 'os';
import { resolve } from 'path';

export type GenerateType = 'service' | 'command';

export class GenerateService {

  constructor() {}

  generate(type: GenerateType, dest: string) {
    if (type === 'service') {
      return this.getServiceData(dest);
    } else if (type === 'command') {
      return this.getCommandData(dest);
    } else {
      throw new Error('Not support type: ' + type);
    }
  }

  private getServiceData(dest: string) {
    const destData = this.processDest(dest, 'lib');
    // content
    const { className } = destData;
    const content = [
      `export class ${className}Service {`,
      '  constructor () {}',
      '}'
    ].join(EOL);
    // result
    return { ...destData, content };
  }

  private getCommandData(dest: string) {
    const destData = this.processDest(dest, 'cli');
    // content
    const { className } = destData;
    const content = [
      `export class ${className}Command {`,
      '  constructor () {}',
      '  run() {}',
      '}'
    ].join(EOL);
    // result
    return { ...destData, content };
  }

  private processDest(dest: string, part = 'lib') {
    const destSplit = dest.split('/');
    const name = (destSplit.pop() as string).split('.')[0].toLowerCase();
    const className = name.charAt(0).toUpperCase() + name.substr(1);
    const path = ['src', part, ...destSplit, `${name}.ts`].join('/');
    const fullPath = resolve(path);
    return { name, className, path, fullPath };
  }

}