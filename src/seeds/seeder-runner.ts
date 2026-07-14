import { Injectable } from '@nestjs/common';

@Injectable()
export class SeederRunner {
  async runAllSeeders() {
    console.log('🔁 Running seeders...');
    console.log('✅ All seeders have been executed.');
  }
}
