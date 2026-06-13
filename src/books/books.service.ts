import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { Genre } from '../genres/entities/genre.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
    @InjectRepository(Genre) private readonly genreRepo: Repository<Genre>,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search, genre } = query;

    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.genres', 'genre');

    if (search) {
      qb.andWhere('book.title ILIKE :search', { search: `%${search}%` });
    }

    if (genre) {
      qb.andWhere('genre.id = :genreId', { genreId: genre });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async create(dto: CreateBookDto): Promise<Book> {
    const genres = await this.genreRepo.findBy({ id: In(dto.genreIds) });
    const book = this.bookRepo.create({
      title: dto.title,
      author: dto.author,
      editor: dto.editor,
      synopsis: dto.synopsis,
      adminScore: dto.adminScore,
      genres,
    });
    return this.bookRepo.save(book);
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepo.findOne({
      where: { id },
      relations: ['genres'],
    });
    if (!book) throw new NotFoundException('Libro no encontrado');
    return book;
  }

  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    const { genreIds, ...scalar } = dto;
    Object.assign(book, scalar);
    if (genreIds) {
      book.genres = await this.genreRepo.findBy({ id: In(genreIds) });
    }
    return this.bookRepo.save(book);
  }

  async remove(id: number): Promise<Book> {
    const book = await this.findOne(id);
    await this.bookRepo.delete(id);
    return book;
  }
}
