package main

import (
	"encoding/json"
	"log"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

func ConsumeQueue(ch chan WeatherMessage) {

	host := os.Getenv("WORKER_RMQ_HOST")
	queueName := os.Getenv("WORKER_QUEUE")

	conn, err := amqp.Dial("amqp://guest:guest@" + host + ":5672/")
	if err != nil {
		log.Fatal("❌ Erro ao conectar ao RabbitMQ:", err)
	}
	defer conn.Close()

	rmqChannel, err := conn.Channel()
	if err != nil {
		log.Fatal("❌ Erro ao abrir canal:", err)
	}
	defer rmqChannel.Close()

	_, err = rmqChannel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatal("❌ Erro ao declarar fila:", err)
	}

	msgs, err := rmqChannel.Consume(
		queueName,
		"",
		false, // auto-ack desativado
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatal("❌ Erro ao registrar consumer:", err)
	}

	log.Println("🐇 Worker Go aguardando mensagens...")

	for msg := range msgs {
		var weather WeatherMessage

		err := json.Unmarshal(msg.Body, &weather)
		if err != nil {
			log.Println("⚠️ Erro ao decodificar JSON:", err)
			msg.Nack(false, false) // rejeita e descarta
			continue
		}

		log.Println("📥 Mensagem recebida:", weather)

		ch <- weather    // envia para o main processar
		msg.Ack(false)   // confirma processamento
	}
}
