import { DownloadService } from './services/download';
import { GenerateService } from './services/generate';
import { CreateService } from './services/create';

export class Main {
  private downloadService: DownloadService;
  private generateService: GenerateService;
  private createService: CreateService;

  constructor() {
    this.downloadService = new DownloadService();
    this.generateService = new GenerateService();
    this.createService = new CreateService(
      this.downloadService,
    );
  }

  get Download() {
    return this.downloadService;
  }

  get Generate() {
    return this.generateService;
  }

  get Create() {
    return this.createService;
  }

}