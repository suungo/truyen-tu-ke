import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Genre } from './genre.entity';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  author: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true, name: 'characters' })
  characters: string;

  @Column({ type: 'text', nullable: true, name: 'setting' })
  setting: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, name: 'cover_image' })
  coverImage: string;

  @ManyToOne(() => Genre, (genre) => genre.stories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ name: 'is_approved', type: 'boolean', default: true })
  isApproved: boolean;

  @Column({ name: 'is_rejected', type: 'boolean', default: false })
  isRejected: boolean;

  @Column({ name: 'is_reader_story', type: 'boolean', default: false })
  isReaderStory: boolean;

  @Column({ name: 'is_short_story', type: 'boolean', default: false })
  isShortStory: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
