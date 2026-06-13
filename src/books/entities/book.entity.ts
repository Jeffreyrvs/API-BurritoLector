import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Genre } from '../../genres/entities/genre.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  author!: string;

  @Column()
  editor!: string;

  @Column('text')
  synopsis!: string;

  @Column({ type: 'int' })
  adminScore!: number;

  @Column({ nullable: true })
  coverImageUrl!: string;

  @Column({ type: 'float', default: 0 })
  communityScore!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => Genre, { cascade: true, eager: false })
  @JoinTable()
  genres!: Genre[];
}
