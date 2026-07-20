import { Module } from '@nestjs/common';
import { VideoGeneratorController } from './video-generator.controller';
import { VideoGeneratorService } from './video-generator.service';
import { VideoGeneratorGateway } from './video-generator.gateway';

@Module({
  controllers: [VideoGeneratorController],
  providers: [VideoGeneratorService, VideoGeneratorGateway],
  exports: [VideoGeneratorService],
})
export class VideoGeneratorModule {}
