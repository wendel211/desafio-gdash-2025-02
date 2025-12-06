import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime
from weather_service import WeatherService


class TestWeatherService(unittest.TestCase):
    
    def setUp(self):
        """Configuração antes de cada teste"""
        self.service = WeatherService()
    
    @patch('weather_service.requests.get')
    def test_get_current_weather_success(self, mock_get):
        """Testa coleta de dados climáticos com sucesso"""
    
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'current': {
                'temperature_2m': 25.5,
                'relative_humidity_2m': 65,
                'wind_speed_10m': 15.0,
                'weather_code': 0
            }
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response
        
        # Executar
        result = self.service.get_current_weather()
        
        # Verificar
        self.assertIsNotNone(result)
        self.assertEqual(result['temperature'], 25.5)
        self.assertEqual(result['humidity'], 65)
        self.assertEqual(result['wind_speed'], 15.0)
        self.assertEqual(result['condition'], 'Céu limpo')
        self.assertIn('timestamp', result)
    
    @patch('weather_service.requests.get')
    def test_get_current_weather_api_error(self, mock_get):
        """Testa tratamento de erro da API"""
        # Simular erro de conexão
        mock_get.side_effect = Exception('Connection error')
        
        # Executar
        result = self.service.get_current_weather()
        
        # Verificar
        self.assertIsNone(result)
    
    def test_map_weather_code_clear(self):
        """Testa mapeamento de código de tempo: céu limpo"""
        result = self.service._map_weather_code(0)
        self.assertEqual(result, 'Céu limpo')
    
    def test_map_weather_code_rain(self):
        """Testa mapeamento de código de tempo: chuva"""
        result = self.service._map_weather_code(61)
        self.assertEqual(result, 'Chuva fraca')
    
    def test_map_weather_code_storm(self):
        """Testa mapeamento de código de tempo: tempestade"""
        result = self.service._map_weather_code(95)
        self.assertEqual(result, 'Tempestade')
    
    def test_map_weather_code_unknown(self):
        """Testa mapeamento de código desconhecido"""
        result = self.service._map_weather_code(999)
        self.assertEqual(result, 'Desconhecido')


if __name__ == '__main__':
    unittest.main()