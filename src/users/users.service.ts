import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Rating } from '../rating/entities/rating.entity';
import { Book } from '../books/entities/book.entity';
import { AffinityResponseDto } from './dto/affinity-response.dto';
import { AffinityBookDto, SimilarBookDto } from './dto/affinity-book.dto';
import { Role } from '../role.enum';

interface CommonBook {
  bookId: number;
  title: string;
  userScore: number;
  otherUserScore: number;
  scoreDifference: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Rating) private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) { }

  async findAll() {
    return this.userRepository.find();
  }

  async getAffinity(currentUserId: number, otherUserId: number): Promise<AffinityResponseDto> {
    try {
      // Validar que los usuarios existan
      const currentUser = await this.userRepository.findOneBy({ id: currentUserId });
      const otherUser = await this.userRepository.findOneBy({ id: otherUserId });

      if (!currentUser) {
        throw new NotFoundException(`Usuario con ID ${currentUserId} no encontrado`);
      }

      if (!otherUser) {
        throw new NotFoundException(`Usuario con ID ${otherUserId} no encontrado`);
      }

      if (currentUserId === otherUserId) {
        throw new BadRequestException('No puedes calcular afinidad contigo mismo');
      }

      // Obtener ratings de ambos usuarios
      const currentUserRatings = await this.ratingRepository.find({
        where: { userId: currentUserId },
      });

      const otherUserRatings = await this.ratingRepository.find({
        where: { userId: otherUserId },
      });

      // Encontrar libros comunes
      const currentUserBookIds = new Set(currentUserRatings.map(r => r.bookId));
      const commonRatings = otherUserRatings.filter(r =>
        currentUserBookIds.has(r.bookId)
      );

      if (commonRatings.length === 0) {
        return {
          affinity: 0,
          commonBooks: [],
          totalCommonBooks: 0,
          booksWithSimilarTaste: 0,
        };
      }

      // Obtener información de los libros comunes
      const bookIds = commonRatings.map(r => r.bookId);
      const books = await this.bookRepository.findBy({ id: In(bookIds) });
      const bookMap = new Map(books.map(b => [b.id, b]));

      // Calcular afinidad
      const commonBooksData: CommonBook[] = [];
      let booksWithSimilarTaste = 0;

      for (const otherRating of commonRatings) {
        const currentRating = currentUserRatings.find(
          r => r.bookId === otherRating.bookId
        );

        if (currentRating) {
          const scoreDifference = Math.abs(currentRating.score - otherRating.score);
          const book = bookMap.get(otherRating.bookId);

          commonBooksData.push({
            bookId: otherRating.bookId,
            title: book?.title || 'Desconocido',
            userScore: currentRating.score,
            otherUserScore: otherRating.score,
            scoreDifference,
          });

          if (scoreDifference <= 1) {
            booksWithSimilarTaste++;
          }
        }
      }

      const totalCommonBooks = commonBooksData.length;
      const affinity = (booksWithSimilarTaste / totalCommonBooks) * 100;

      return {
        affinity: Math.round(affinity * 100) / 100, // Redondear a 2 decimales
        commonBooks: commonBooksData,
        totalCommonBooks,
        booksWithSimilarTaste,
      };
    } catch (err) {
      Logger.error({ message: 'Error en getAffinity', error: err, currentUserId, otherUserId }, 'UsersService');
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Error al calcular afinidad');
    }
  }

  async getAffinityTable(currentUserId: number): Promise<SimilarBookDto[]> {
    try {
      // 1. Mis ratings
      const myRatings = await this.ratingRepository.find({
        where: { userId: currentUserId },
      });

      if (!myRatings.length) return [];

      const myBookIds = new Set(myRatings.map(r => r.bookId));
      const myScoreMap = new Map(myRatings.map(r => [r.bookId, r.score]));

      // 2. Ratings de otros usuarios en los mismos libros
      const otherRatings = await this.ratingRepository.find({
        where: { bookId: In([...myBookIds]) },
      });

      const othersFiltered = otherRatings.filter(r => r.userId !== currentUserId);

      if (!othersFiltered.length) return [];

      // 3. Traer libros y usuarios involucrados
      const bookIds = [...new Set(othersFiltered.map(r => r.bookId))];
      const userIds = [...new Set(othersFiltered.map(r => r.userId))];

      const [books, users] = await Promise.all([
        this.bookRepository.findBy({ id: In(bookIds) }),
        this.userRepository.findBy({ id: In(userIds) }),
      ]);

      const bookMap = new Map(books.map(b => [b.id, b.title]));
      const userMap = new Map(users.map(u => [u.id, u.name])); 

      // 4. Construir filas
      return othersFiltered.map(r => ({
        bookId: r.bookId,
        title: bookMap.get(r.bookId) ?? `Libro #${r.bookId}`,
        lector: userMap.get(r.userId) ?? `Usuario #${r.userId}`,
        userScore: myScoreMap.get(r.bookId) ?? 0,
        otherUserScore: r.score,
        scoreDifference: Math.abs((myScoreMap.get(r.bookId) ?? 0) - r.score),
      }));

    } catch (err) {
      Logger.error({ message: 'Error en getAffinityTable', error: err, currentUserId }, 'UsersService');
      throw new InternalServerErrorException('Error al obtener tabla de afinidad');
    }
  }

  // Metodos adicionales 
  async contarLectores() {
    const total = await this.userRepository.count({
      where: {
        role: Not(Role.ADMIN),
      },
    });

    return { total };
  }

}
