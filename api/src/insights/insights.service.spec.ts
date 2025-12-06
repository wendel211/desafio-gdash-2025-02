import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { WeatherService } from '../weather/weather.service';

describe('InsightsService', () => {
  let service: InsightsService;
  let weatherService: WeatherService;

  const mockWeatherLogs = [
    {
      temperature: 30,
      humidity: 70,
      wind_speed: 10,
      timestamp: new Date('2024-12-06T10:00:00Z'),
    },
    {
      temperature: 28,
      humidity: 65,
      wind_speed: 12,
      timestamp: new Date('2024-12-06T11:00:00Z'),
    },
    {
      temperature: 32,
      humidity: 75,
      wind_speed: 8,
      timestamp: new Date('2024-12-06T12:00:00Z'),
    },
  ];

  const mockWeatherService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateInsights', () => {
    it('deve retornar mensagem quando não há dados suficientes', async () => {
      mockWeatherService.findAll.mockResolvedValue([mockWeatherLogs[0]]);

      const result = await service.generateInsights();

      expect(result.message).toBe('Not enough data to generate insights');
      expect(result.stats).toBeNull();
    });

    it('deve gerar insights com dados suficientes', async () => {
      mockWeatherService.findAll.mockResolvedValue(mockWeatherLogs);

      const result = await service.generateInsights();

      expect(result.stats).toBeDefined();
      expect(result.stats?.avgTemperature).toBe(30); // (30+28+32)/3
      expect(result.stats?.avgHumidity).toBeCloseTo(70, 0);
      expect(result.stats?.avgWind).toBeCloseTo(10, 0);
      expect(result.message).toContain('Temperatura média');
    });

    it('deve detectar tendência de aquecimento', async () => {
      const heatingLogs = [
        { ...mockWeatherLogs[0], temperature: 25 },
        { ...mockWeatherLogs[1], temperature: 28 },
        { ...mockWeatherLogs[2], temperature: 32 },
      ];
      mockWeatherService.findAll.mockResolvedValue(heatingLogs);

      const result = await service.generateInsights();

      expect(result.stats?.trendTemperature).toBe('up');
      expect(result.message).toContain('aquecimento');
    });

    it('deve detectar tendência de resfriamento', async () => {
      const coolingLogs = [
        { ...mockWeatherLogs[0], temperature: 32 },
        { ...mockWeatherLogs[1], temperature: 28 },
        { ...mockWeatherLogs[2], temperature: 25 },
      ];
      mockWeatherService.findAll.mockResolvedValue(coolingLogs);

      const result = await service.generateInsights();

      expect(result.stats?.trendTemperature).toBe('down');
      expect(result.message).toContain('resfriamento');
    });

    it('deve detectar calor intenso', async () => {
      const hotLogs = mockWeatherLogs.map((log) => ({
        ...log,
        temperature: 35,
      }));
      mockWeatherService.findAll.mockResolvedValue(hotLogs);

      const result = await service.generateInsights();

      expect(result.message).toContain('calor intenso');
    });

    it('deve detectar clima frio', async () => {
      const coldLogs = mockWeatherLogs.map((log) => ({
        ...log,
        temperature: 15,
      }));
      mockWeatherService.findAll.mockResolvedValue(coldLogs);

      const result = await service.generateInsights();

      expect(result.message).toContain('frio');
    });
  });
});