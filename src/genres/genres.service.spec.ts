import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GenresService } from './genres.service';
import { Genre } from './entities/genre.entity';

type MockRepo = Partial<Record<keyof Repository<Genre>, jest.Mock>>;

const createMockRepo = (): MockRepo => ({
  findOneBy: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
});

describe('GenresService', () => {
  let service: GenresService;
  let repo: MockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    repo = module.get(getRepositoryToken(Genre));
  });

  describe('create()', () => {
    it('crea y devuelve un género cuando el nombre es único', async () => {
      repo.findOneBy!.mockResolvedValue(null);
      const saved = { id: 1, name: 'Ficción' };
      repo.save!.mockResolvedValue(saved);

      const result = await service.create({ name: 'Ficción' });

      expect(result).toEqual(saved);
      expect(repo.save).toHaveBeenCalledWith({ name: 'Ficción' });
    });

    it('lanza ConflictException cuando el nombre ya existe', async () => {
      repo.findOneBy!.mockResolvedValue({ id: 1, name: 'Ficción' });

      await expect(service.create({ name: 'Ficción' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll()', () => {
    it('devuelve un arreglo de géneros', async () => {
      const genres = [{ id: 1, name: 'Ficción' }, { id: 2, name: 'Terror' }];
      repo.find!.mockResolvedValue(genres);

      const result = await service.findAll();

      expect(result).toEqual(genres);
    });
  });

  describe('remove()', () => {
    it('elimina y devuelve el género cuando existe', async () => {
      const genre = { id: 1, name: 'Ficción' };
      repo.findOneBy!.mockResolvedValue(genre);
      repo.delete!.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(genre);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundException cuando el género no existe', async () => {
      repo.findOneBy!.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
