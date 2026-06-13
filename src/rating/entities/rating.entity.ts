import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;
   
  @Column({ type: 'int' })
  bookId!: number;

  @Column({ type: 'int' })
  score!: number;
    
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;







}
