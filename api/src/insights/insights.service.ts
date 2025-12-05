import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';
import { ClimateStats, InsightResponse } from './types/insights.types';

@Injectable()
export class InsightsService {
  constructor(private weatherService: WeatherService) {}

  async generateInsights(): Promise<InsightResponse> {
    const logs = await this.weatherService.findAll({});

    if (logs.length < 2) {
      return {
        stats: null,
        message: 'Not enough data to generate insights',
      };
    }

    const temps = logs.map((l) => l.temperature);
    const hums = logs.map((l) => l.humidity);
    const winds = logs.map((l) => l.wind_speed);

    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    const stats: ClimateStats = {
      avgTemperature: avg(temps),
      avgHumidity: avg(hums),
      avgWind: avg(winds),

      minTemperature: Math.min(...temps),
      maxTemperature: Math.max(...temps),

      trendTemperature:
        temps[0] < temps[temps.length - 1]
          ? 'up'
          : temps[0] > temps[temps.length - 1]
          ? 'down'
          : 'stable',
    };

    const message = this.generateInsightMessage(stats);

    return { stats, message };
  }

  /** IA baseada em regras + linguagem natural */
  private generateInsightMessage(stats: ClimateStats): string {
    const { avgTemperature, avgHumidity, trendTemperature } = stats;

    let msg = `Temperatura média de ${avgTemperature.toFixed(
      1,
    )}°C, umidade média em ${avgHumidity.toFixed(1)}%. `;

    if (trendTemperature === 'up') {
      msg += 'Existe tendência de aquecimento nos últimos registros. ';
    } else if (trendTemperature === 'down') {
      msg += 'Tendência de resfriamento observada nos últimos registros. ';
    } else {
      msg += 'Estabilidade de temperatura observada. ';
    }

    if (avgTemperature >= 30) {
      msg += 'Condição de calor intenso, risco de desconforto térmico elevado.';
    } else if (avgTemperature <= 20) {
      msg += 'Clima mais frio, condições agradáveis para atividades externas.';
    } else {
      msg += 'Clima moderado e estável.';
    }

    return msg;
  }
}
