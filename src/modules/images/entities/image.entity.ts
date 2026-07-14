import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TypeImage {
  AVATAR = 'avatar',
  COVER = 'cover',
  STORY = 'story',
}

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  url: string;

  @Column()
  publicId: string;

  @Column()
  refId: number;

  @Column()
  type: TypeImage;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
