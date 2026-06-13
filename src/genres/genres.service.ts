import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';
import { CreateGenreDto } from './dto/create-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre) private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(dto: CreateGenreDto): Promise<Genre> {
    const exists = await this.genreRepository.findOneBy({ name: dto.name });
    if (exists) {
      throw new ConflictException('El género ya existe');
    }
    return this.genreRepository.save(dto);
  }

  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find();
  }

  async remove(id: number): Promise<Genre> {
    const genre = await this.genreRepository.findOneBy({ id });
    if (!genre) {
      throw new NotFoundException('Género no encontrado');
    }
    await this.genreRepository.delete(id);
    return genre;
  }
}
