import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Column as column, PrimaryGeneratedColumn as primaryGeneratedColumn } from 'typeorm';

export class Rating {
    @primaryGeneratedColumn()
    id!: number;
    
    @column({ type: 'int' })
    userId!: number;
   
    @column({ type: 'int' })
    bookId!: number;
    
    @column({ type: 'int' })
    score!: number;
    
    @column({ type: 'text', nullable: true })
    createdAt!: Date;
    
    @column({ type: 'text', nullable: true })
    updatedAt!: Date;







}
