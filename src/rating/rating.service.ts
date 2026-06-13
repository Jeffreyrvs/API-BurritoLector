import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Rating } from './entities/rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating) private readonly ratingRepository: Repository<Rating>,
  ) {}

  async create(dto: CreateRatingDto): Promise<Rating> {
    const exists = await this.ratingRepository.findOneBy({
      userId: dto.userId,
      bookId: dto.bookId,
    });

    if (exists) {
      throw new ConflictException('El rating ya existe');
    }

    return this.ratingRepository.save(dto);
  }

  findAll() {
    return this.ratingRepository.find();
  }

  findOne(id: number) {
    return this.ratingRepository.findOneBy({ id });
  }

  update(id: number, updateRatingDto: UpdateRatingDto) {
    return this.ratingRepository.update(id, updateRatingDto);
  }

  async remove(bookId: number): Promise<Rating[]> {
    const ratings = await this.ratingRepository.find({ where: { bookId } });

    if (!ratings.length) {
      throw new NotFoundException('No hay ratings para ese libro');
    }

    await this.ratingRepository.delete({ bookId });
    return ratings;
  }
}
