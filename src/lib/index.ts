import { FileService } from './services/file.service';
import { DownloadService } from './services/download.service';
import { GenerateService } from './services/generate.service';
import { CreateService } from './services/create.service';

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
