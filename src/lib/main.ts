import { GenerateService } from './services/generate';

export class Main {
  private generateService: GenerateService;

  constructor() {
    this.generateService = new GenerateService();
  }

  get Generate() {
    return this.generateService;
  }

}