import os
import logging
import requests
from datetime import datetime
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self):
        self.api_url = os.getenv('WEATHER_API_URL', 'https://api.open-meteo.com/v1/forecast')
        self.latitude = float(os.getenv('CITY_LAT', '-12.27'))
        self.longitude = float(os.getenv('CITY_LON', '-38.97'))
        
        logger.info(f"🌍 Configurado para: Lat {self.latitude}, Lon {self.longitude}")
    
    def get_current_weather(self) -> Optional[Dict]:
        """
        Busca dados climáticos atuais da API Open-Meteo
        Retorna dict com: temperature, humidity, wind_speed, condition, timestamp
        """
        try:
            params = {
                'latitude': self.latitude,
                'longitude': self.longitude,
                'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
                'timezone': 'auto'
            }
            
            logger.info(f"📡 Fazendo requisição para Open-Meteo...")
            response = requests.get(self.api_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            current = data.get('current', {})
            
            weather_code = current.get('weather_code', 0)
            condition = self._map_weather_code(weather_code)
            
            weather_data = {
                'temperature': current.get('temperature_2m', 0),
                'humidity': current.get('relative_humidity_2m', 0),
                'wind_speed': current.get('wind_speed_10m', 0),
                'condition': condition,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.info(
                f"✅ Dados obtidos: Temp={weather_data['temperature']}°C, "
                f"Umidade={weather_data['humidity']}%, "
                f"Vento={weather_data['wind_speed']}km/h, "
                f"Condição={weather_data['condition']}"
            )
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro ao buscar dados climáticos: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Erro inesperado: {str(e)}")
            return None
    
    def _map_weather_code(self, code: int) -> str:
        """
        Mapeia códigos WMO Weather para descrições em texto (PT-BR)
        Fonte: https://open-meteo.com/en/docs
        """
        weather_codes = {
            0: 'Céu limpo',
            1: 'Predominantemente limpo',
            2: 'Parcialmente nublado',
            3: 'Encoberto',
            45: 'Neblina',
            48: 'Neblina com gelo',
            51: 'Garoa leve',
            53: 'Garoa moderada',
            55: 'Garoa intensa',
            61: 'Chuva fraca',
            63: 'Chuva moderada',
            65: 'Chuva forte',
            71: 'Neve fraca',
            73: 'Neve moderada',
            75: 'Neve forte',
            77: 'Grãos de neve',
            80: 'Pancadas de chuva leves',
            81: 'Pancadas de chuva moderadas',
            82: 'Pancadas de chuva fortes',
            85: 'Pancadas de neve leves',
            86: 'Pancadas de neve fortes',
            95: 'Tempestade',
            96: 'Tempestade com granizo leve',
            99: 'Tempestade com granizo forte'
        }
        
        return weather_codes.get(code, 'Desconhecido')
