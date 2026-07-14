import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FrameworkPhase } from './framework-phase.entity';

@Entity('framework_episodes')
export class FrameworkEpisode {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FrameworkPhase, (phase) => phase.episodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'phase_id' })
  phase: FrameworkPhase;

  @Column({ name: 'phase_id' })
  phaseId: number;

  @Column({ name: 'episode_number', type: 'int' })
  episodeNumber: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  synopsis: string;

  @Column({ type: 'text', nullable: true, name: 'key_events' })
  keyEvents: string;

  @Column({ type: 'text', nullable: true, name: 'characters_involved' })
  charactersInvolved: string;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;
}
