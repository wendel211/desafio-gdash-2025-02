# 🐍 Weather Collector (Python)

Serviço responsável por **coletar dados climáticos** periodicamente e enviar para o **RabbitMQ**.

---

## 🚀 Rodar localmente
```sh
pip install -r requirements.txt
python collector.py
```

---

## 📡 Variáveis
```
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
QUEUE_NAME=weather_queue
WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
WEATHER_LAT=-12.97
WEATHER_LON=-38.50
```

---

## 🔄 Funcionamento

1. Faz requisição à Open Meteo
2. Extrai temperatura, umidade, vento e condição
3. Envia JSON para RabbitMQ
4. Repete a cada 10 segundos