import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Story } from './story.entity';
import { FrameworkPhase } from './framework-phase.entity';

@Entity('story_frameworks')
export class StoryFramework {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'story_id' })
  storyId: number;

  @Column({ name: 'total_episodes', type: 'int', default: 0 })
  totalEpisodes: number;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @OneToMany(() => FrameworkPhase, (phase) => phase.framework, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  phases: FrameworkPhase[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
