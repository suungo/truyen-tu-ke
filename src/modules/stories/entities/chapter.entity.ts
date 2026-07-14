import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Story } from './story.entity';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'story_id' })
  storyId: number;

  @Column({ name: 'chapter_number' })
  chapterNumber: number;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  synopsis: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
