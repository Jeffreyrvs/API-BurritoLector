import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Genre } from '../genres/entities/genre.entity';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Genre])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
