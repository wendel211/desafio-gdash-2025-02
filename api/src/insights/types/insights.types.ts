export interface InsightResponse {
  stats: ClimateStats | null; // Adicione | null aqui
  message: string;
}

export interface ClimateStats {
  avgTemperature: number;
  avgHumidity: number;
  avgWind: number;
  minTemperature: number;
  maxTemperature: number;
  trendTemperature: 'up' | 'down' | 'stable';
}