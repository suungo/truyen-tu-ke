import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StoryFramework } from './story-framework.entity';
import { FrameworkEpisode } from './framework-episode.entity';

@Entity('framework_phases')
export class FrameworkPhase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StoryFramework, (fw) => fw.phases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'framework_id' })
  framework: StoryFramework;

  @Column({ name: 'framework_id' })
  frameworkId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'episode_from', type: 'int' })
  episodeFrom: number;

  @Column({ name: 'episode_to', type: 'int' })
  episodeTo: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @OneToMany(() => FrameworkEpisode, (ep) => ep.phase, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  episodes: FrameworkEpisode[];
}
