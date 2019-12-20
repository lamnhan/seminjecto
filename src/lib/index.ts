import { FileService } from './services/file';
import { DownloadService } from './services/download';
import { GenerateService } from './services/generate';
import { CreateService } from './services/create';

export class Main {
  fileService: FileService;
  downloadService: DownloadService;
  generateService: GenerateService;
  createService: CreateService;

  constructor() {
    this.fileService = new FileService();
    this.downloadService = new DownloadService();
    this.generateService = new GenerateService(this.fileService);
    this.createService = new CreateService(
      this.fileService,
      this.downloadService
    );
  }
}
