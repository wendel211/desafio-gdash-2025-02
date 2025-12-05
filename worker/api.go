package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

func SendToAPI(data WeatherMessage) error {
	apiURL := os.Getenv("API_URL")

	bodyBytes, err := json.Marshal(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	client := http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Println("⚠️ Erro ao enviar para API:", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		log.Println("⚠️ API retornou código inesperado:", resp.Status)
		return err
	}

	log.Println("✔️ Dados enviados para API com sucesso:", data)
	return nil
}
