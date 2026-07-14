import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Story } from './story.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @OneToMany(() => Story, (story) => story.genre)
  stories: Story[];
}
