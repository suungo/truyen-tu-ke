import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryFramework } from '../stories/entities/story-framework.entity';
import { FrameworkPhase } from '../stories/entities/framework-phase.entity';
import { FrameworkEpisode } from '../stories/entities/framework-episode.entity';
import { Story } from '../stories/entities/story.entity';
import { FrameworkService } from './framework.service';
import { FrameworkController } from './framework.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoryFramework,
      FrameworkPhase,
      FrameworkEpisode,
      Story,
    ]),
  ],
  controllers: [FrameworkController],
  providers: [FrameworkService],
  exports: [TypeOrmModule, FrameworkService],
})
export class FrameworkModule {}
