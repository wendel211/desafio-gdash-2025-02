import os
import time
import json
import logging
from datetime import datetime
from weather_service import WeatherService
from queue_service import QueueService

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WeatherCollector:
    def __init__(self):
        self.weather_service = WeatherService()
        self.queue_service = QueueService()
        self.interval = int(os.getenv('COLLECTOR_INTERVAL', '3600'))  # padrão: 1 hora
        
    def collect_and_send(self):
        """Coleta dados do clima e envia para a fila"""
        try:
            logger.info("🌤️  Iniciando coleta de dados climáticos...")
            
            # Busca dados da API Open-Meteo
            weather_data = self.weather_service.get_current_weather()
            
            if not weather_data:
                logger.error("❌ Falha ao obter dados climáticos")
                return False
            
            # Prepara payload para enviar à fila
            payload = {
                "temperature": weather_data["temperature"],
                "humidity": weather_data["humidity"],
                "wind_speed": weather_data["wind_speed"],
                "condition": weather_data["condition"],
                "timestamp": weather_data["timestamp"]
            }
            
            logger.info(f"📦 Dados coletados: {json.dumps(payload, indent=2)}")
            
            # Envia para a fila RabbitMQ
            success = self.queue_service.send_to_queue(payload)
            
            if success:
                logger.info("✅ Dados enviados com sucesso para a fila!")
                return True
            else:
                logger.error("❌ Falha ao enviar dados para a fila")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro na coleta: {str(e)}")
            return False
    
    def run(self):
        """Executa o coletor em loop"""
        logger.info("🚀 Coletor de dados climáticos iniciado!")
        logger.info(f"⏱️  Intervalo de coleta: {self.interval} segundos")
        
        # Conecta ao RabbitMQ
        if not self.queue_service.connect():
            logger.error("❌ Falha ao conectar ao RabbitMQ. Encerrando...")
            return
        
        try:
            while True:
                self.collect_and_send()
                
                if self.interval > 0:
                    logger.info(f"😴 Aguardando {self.interval} segundos até a próxima coleta...")
                    time.sleep(self.interval)
                else:
                    logger.info("🔄 Modo teste: executando apenas uma vez")
                    break
                    
        except KeyboardInterrupt:
            logger.info("⚠️  Interrupção detectada. Encerrando...")
        finally:
            self.queue_service.close()
            logger.info("👋 Coletor encerrado!")


if __name__ == "__main__":
    collector = WeatherCollector()
    collector.run()