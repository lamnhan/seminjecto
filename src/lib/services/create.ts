import axios from 'axios';

import { DownloadService } from './download';

export class CreateService {

  constructor (private downloadService: DownloadService) {}

  async createLib(dest: string) {
    return this.create('lib', dest);
  }

  async createCli(dest: string) {
    return this.create('cli', dest);
  }
  
  private async create(type: 'lib' | 'cli', dest: string) {
    const url = await this.resolveLatestRelease('lamnhan/seminjecto-' + type);
    const filePath = dest + '/download.zip';
    return this.downloadService.downloadAndUnzip(url, filePath);
  }

  private async resolveLatestRelease(pkg: string) {
    const { data } = await axios({
      method: 'GET',
      url: `https://api.github.com/repos/${pkg}/releases/latest`,
    });
    const name = pkg;
    const version = data.name;
    return `https://github.com/${name}/archive/${version}.zip`;;
  }

}