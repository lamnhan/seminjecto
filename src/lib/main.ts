import { FileService } from './services/file';
import { DownloadService } from './services/download';
import { GenerateService } from './services/generate';
import { CreateService } from './services/create';

export class Main {
  private fileService: FileService;
  private downloadService: DownloadService;
  private generateService: GenerateService;
  private createService: CreateService;

  constructor() {
    this.fileService = new FileService();
    this.downloadService = new DownloadService();
    this.generateService = new GenerateService(
      this.fileService,
    );
    this.createService = new CreateService(
      this.fileService,
      this.downloadService,
    );
  }

  get File() {
    return this.fileService;
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