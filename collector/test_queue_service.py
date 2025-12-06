import unittest
from unittest.mock import patch, MagicMock
import json
from queue_service import QueueService


class TestQueueService(unittest.TestCase):
    
    def setUp(self):
        """Configuração antes de cada teste"""
        self.service = QueueService()
    
    @patch('queue_service.pika.BlockingConnection')
    def test_connect_success(self, mock_connection):
        """Testa conexão bem-sucedida ao RabbitMQ"""

        mock_channel = MagicMock()
        mock_conn = MagicMock()
        mock_conn.channel.return_value = mock_channel
        mock_connection.return_value = mock_conn
        
        # Executar
        result = self.service.connect()
        
 
        self.assertTrue(result)
        mock_channel.queue_declare.assert_called_once()
    
    @patch('queue_service.pika.BlockingConnection')
    def test_connect_failure(self, mock_connection):
        """Testa falha na conexão ao RabbitMQ"""

        mock_connection.side_effect = Exception('Connection failed')
        

        result = self.service.connect()
        
  
        self.assertFalse(result)
    
    def test_send_to_queue_success(self):
        """Testa envio de mensagem para fila"""

        mock_channel = MagicMock()
        self.service.channel = mock_channel
        

        test_data = {
            'temperature': 25.5,
            'humidity': 65,
            'wind_speed': 15,
            'condition': 'Ensolarado',
            'timestamp': '2024-12-06T10:00:00Z'
        }
        
        
        result = self.service.send_to_queue(test_data)
    
        self.assertTrue(result)
        mock_channel.basic_publish.assert_called_once()
        

        call_args = mock_channel.basic_publish.call_args
        message_body = call_args[1]['body']
        parsed_data = json.loads(message_body)
        self.assertEqual(parsed_data['temperature'], 25.5)
    
    def test_send_to_queue_no_channel(self):
        """Testa envio sem canal conectado"""
        self.service.channel = None
        
        test_data = {'temperature': 25.5}
        

        result = self.service.send_to_queue(test_data)
        

        self.assertFalse(result)
    
    def test_close_connection(self):
        """Testa fechamento de conexão"""
        # Mock da conexão
        mock_conn = MagicMock()
        mock_conn.is_closed = False
        self.service.connection = mock_conn
        

        self.service.close()
        

        mock_conn.close.assert_called_once()


if __name__ == '__main__':
    unittest.main()