import {FileService} from './services/file.service';
import {DownloadService} from './services/download.service';
import {GenerateService} from './services/generate.service';
import {CreateService} from './services/create.service';
import {ModifyService} from './services/modify.service';

export class Lib {
  fileService: FileService;
  downloadService: DownloadService;
  generateService: GenerateService;
  createService: CreateService;
  modifyService: ModifyService;

  constructor() {
    this.fileService = new FileService();
    this.downloadService = new DownloadService();
    this.generateService = new GenerateService();
    this.createService = new CreateService(
      this.fileService,
      this.downloadService
    );
    this.modifyService = new ModifyService(this.fileService);
  }
}
