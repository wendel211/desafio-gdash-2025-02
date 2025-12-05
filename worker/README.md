# ⚙ Worker — Go

Serviço que consome mensagens da fila `weather_queue` e envia para a API NestJS.

---

## ▶️ Execução local
```sh
go mod tidy
go run main.go
```

---

## 🔧 Variáveis
```
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
API_URL=http://api:3000
QUEUE_NAME=weather_queue
```

---

## 🔄 Fluxo

1. Conecta no RabbitMQ
2. Consome mensagens JSON
3. Chama `POST /weather` da API
4. Registra logs no console