import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherLog } from './schemas/weather-log.schema';

describe('WeatherService', () => {
  let service: WeatherService;

  const mockWeatherLog = {
    _id: '507f1f77bcf86cd799439011',
    temperature: 25.5,
    humidity: 65,
    wind_speed: 15,
    condition: 'Ensolarado',
    timestamp: new Date('2024-12-06T10:00:00Z'),
  };

  const mockWeatherModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: mockWeatherModel,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar novo registro climático', async () => {
      const createDto = {
        temperature: 25.5,
        humidity: 65,
        wind_speed: 15,
        condition: 'Ensolarado',
        timestamp: '2024-12-06T10:00:00Z',
      };

      mockWeatherModel.create.mockResolvedValue(mockWeatherLog);

      const result = await service.create(createDto);

      expect(mockWeatherModel.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockWeatherLog);
    });

    it('deve invalidar cache ao criar novo registro', async () => {
      const createDto = {
        temperature: 25.5,
        humidity: 65,
        wind_speed: 15,
        condition: 'Ensolarado',
        timestamp: '2024-12-06T10:00:00Z',
      };

      mockWeatherModel.create.mockResolvedValue(mockWeatherLog);

      await service.create(createDto);

      // Cache deve ser null após criação
      expect(service['insightsCache']).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os registros ordenados por data', async () => {
      const logs = [mockWeatherLog, { ...mockWeatherLog, _id: '123' }];
      mockWeatherModel.find().sort().exec.mockResolvedValue(logs);

      const result = await service.findAll({});

      expect(result).toEqual(logs);
      expect(mockWeatherModel.find).toHaveBeenCalled();
    });

    it('deve filtrar por data de início', async () => {
      const query = { start: '2024-12-01T00:00:00Z' };
      mockWeatherModel.find().sort().exec.mockResolvedValue([mockWeatherLog]);

      await service.findAll(query);

      expect(mockWeatherModel.find).toHaveBeenCalledWith({
        timestamp: { $gte: new Date(query.start) },
      });
    });

    it('deve filtrar por intervalo de datas', async () => {
      const query = {
        start: '2024-12-01T00:00:00Z',
        end: '2024-12-06T23:59:59Z',
      };
      mockWeatherModel.find().sort().exec.mockResolvedValue([mockWeatherLog]);

      await service.findAll(query);

      expect(mockWeatherModel.find).toHaveBeenCalledWith({
        timestamp: {
          $gte: new Date(query.start),
          $lte: new Date(query.end),
        },
      });
    });
  });

  describe('exportCSV', () => {
    it('deve exportar dados em formato CSV', async () => {
      const logs = [mockWeatherLog];
      mockWeatherModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(logs),
        }),
      });

      const result = await service.exportCSV();

      expect(typeof result).toBe('string');
      expect(result).toContain('temperature');
      expect(result).toContain('humidity');
    });
  });
});