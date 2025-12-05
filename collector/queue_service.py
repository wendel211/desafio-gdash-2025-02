import os
import json
import logging
import pika
from typing import Dict

logger = logging.getLogger(__name__)


class QueueService:
    def __init__(self):
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
        self.queue_name = os.getenv('QUEUE_NAME', 'weather_queue')
        self.connection = None
        self.channel = None
        
    def connect(self) -> bool:
        """Estabelece conexão com RabbitMQ"""
        try:
            logger.info(f"🔌 Conectando ao RabbitMQ: {self.rabbitmq_url}")
            
            # Parse da URL do RabbitMQ
            parameters = pika.URLParameters(self.rabbitmq_url)
            
            # Tenta conectar com timeout e retry
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declara a fila (cria se não existir)
            self.channel.queue_declare(
                queue=self.queue_name,
                durable=True  # Fila persistente
            )
            
            logger.info(f"✅ Conectado ao RabbitMQ! Fila: {self.queue_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao conectar ao RabbitMQ: {str(e)}")
            return False
    
    def send_to_queue(self, data: Dict) -> bool:
        """Envia dados para a fila RabbitMQ"""
        try:
            if not self.channel:
                logger.error("❌ Canal não está conectado!")
                return False
            
            # Converte para JSON
            message = json.dumps(data)
            
            # Publica mensagem na fila
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Mensagem persistente
                    content_type='application/json'
                )
            )
            
            logger.info(f"📤 Mensagem enviada para fila '{self.queue_name}'")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mensagem: {str(e)}")
            # Tenta reconectar
            self.connect()
            return False
    
    def close(self):
        """Fecha conexão com RabbitMQ"""
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("👋 Conexão com RabbitMQ fechada")
        except Exception as e:
            logger.error(f"❌ Erro ao fechar conexão: {str(e)}")