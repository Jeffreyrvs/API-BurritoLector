import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { Genre } from '../genres/entities/genre.entity';

describe('BooksService', () => {
  let service: BooksService;
  let mockBookRepo: Record<string, jest.Mock>;
  let mockGenreRepo: Record<string, jest.Mock>;
  let mockQB: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockQB = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    mockBookRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQB),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockGenreRepo = {
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockBookRepo },
        { provide: getRepositoryToken(Genre), useValue: mockGenreRepo },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  describe('findAll()', () => {
    it('devuelve lastPage correcto para la paginación', async () => {
      mockQB.getManyAndCount.mockResolvedValue([[], 25]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.total).toBe(25);
      expect(result.lastPage).toBe(3);
      expect(result.page).toBe(1);
    });

    it('aplica filtro ILIKE cuando se proporciona búsqueda', async () => {
      mockQB.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, search: 'ficcion' });

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%ficcion%' }),
      );
    });

    it('aplica filtro por género cuando se proporciona genre id', async () => {
      mockQB.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, genre: 5 });

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('genre.id'),
        expect.objectContaining({ genreId: 5 }),
      );
    });
  });

  describe('create()', () => {
    it('crea un libro con géneros asociados', async () => {
      const genres = [{ id: 1, name: 'Ficción' }];
      mockGenreRepo.findBy.mockResolvedValue(genres);
      const bookStub = { id: 1, title: 'El libro', genres };
      mockBookRepo.create.mockReturnValue(bookStub);
      mockBookRepo.save.mockResolvedValue(bookStub);

      const result = await service.create({
        title: 'El libro', author: 'Autor', editor: 'Editorial',
        synopsis: 'Sinopsis', adminScore: 4, genreIds: [1],
      });

      expect(result).toEqual(bookStub);
      expect(mockBookRepo.save).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('devuelve el libro cuando existe', async () => {
      const book = { id: 1, title: 'El libro', genres: [] };
      mockBookRepo.findOne.mockResolvedValue(book);

      const result = await service.findOne(1);

      expect(result).toEqual(book);
    });

    it('lanza NotFoundException cuando el libro no existe', async () => {
      mockBookRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('elimina y devuelve el libro cuando existe', async () => {
      const book = { id: 1, title: 'El libro', genres: [] };
      mockBookRepo.findOne.mockResolvedValue(book);
      mockBookRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(book);
      expect(mockBookRepo.delete).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundException cuando el libro no existe', async () => {
      mockBookRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
