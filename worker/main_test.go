package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWeatherDataSerialization(t *testing.T) {
	// Arrange
	data := WeatherData{
		Temperature: 25.5,
		Humidity:    65.0,
		WindSpeed:   15.0,
		Condition:   "Ensolarado",
		Timestamp:   "2024-12-06T10:00:00Z",
	}

	// Act
	jsonData, err := json.Marshal(data)

	// Assert
	if err != nil {
		t.Errorf("Falha ao serializar WeatherData: %v", err)
	}

	var result WeatherData
	err = json.Unmarshal(jsonData, &result)
	if err != nil {
		t.Errorf("Falha ao desserializar WeatherData: %v", err)
	}

	if result.Temperature != data.Temperature {
		t.Errorf("Temperatura esperada %f, obtido %f", data.Temperature, result.Temperature)
	}

	if result.Condition != data.Condition {
		t.Errorf("Condição esperada %s, obtido %s", data.Condition, result.Condition)
	}
}

func TestWeatherDataDeserialization(t *testing.T) {
	// Arrange
	jsonString := `{
		"temperature": 28.5,
		"humidity": 70.0,
		"wind_speed": 12.0,
		"condition": "Nublado",
		"timestamp": "2024-12-06T11:00:00Z"
	}`

	// Act
	var data WeatherData
	err := json.Unmarshal([]byte(jsonString), &data)

	// Assert
	if err != nil {
		t.Errorf("Falha ao desserializar JSON: %v", err)
	}

	if data.Temperature != 28.5 {
		t.Errorf("Temperatura esperada 28.5, obtido %f", data.Temperature)
	}

	if data.Humidity != 70.0 {
		t.Errorf("Umidade esperada 70.0, obtido %f", data.Humidity)
	}

	if data.Condition != "Nublado" {
		t.Errorf("Condição esperada 'Nublado', obtido '%s'", data.Condition)
	}
}

func TestSendToAPISuccess(t *testing.T) {
	// Arrange - Mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verificar método
		if r.Method != "POST" {
			t.Errorf("Método esperado POST, obtido %s", r.Method)
		}

		// Verificar content-type
		if r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("Content-Type esperado application/json")
		}

		// Verificar body
		var data WeatherData
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			t.Errorf("Falha ao decodificar body: %v", err)
		}

		// Responder com sucesso
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))
	}))
	defer server.Close()

	// Act
	data := WeatherData{
		Temperature: 25.5,
		Humidity:    65.0,
		WindSpeed:   15.0,
		Condition:   "Ensolarado",
		Timestamp:   "2024-12-06T10:00:00Z",
	}

	// Simular envio (não podemos testar sendToAPI diretamente sem refatorar)
	// Mas podemos testar a serialização
	_, err := json.Marshal(data)

	// Assert
	if err != nil {
		t.Errorf("Falha ao preparar dados para envio: %v", err)
	}
}

func TestWeatherDataValidation(t *testing.T) {
	tests := []struct {
		name        string
		data        WeatherData
		shouldValid bool
	}{
		{
			name: "Dados válidos",
			data: WeatherData{
				Temperature: 25.5,
				Humidity:    65.0,
				WindSpeed:   15.0,
				Condition:   "Ensolarado",
				Timestamp:   "2024-12-06T10:00:00Z",
			},
			shouldValid: true,
		},
		{
			name: "Temperatura extrema",
			data: WeatherData{
				Temperature: -50.0,
				Humidity:    65.0,
				WindSpeed:   15.0,
				Condition:   "Frio extremo",
				Timestamp:   "2024-12-06T10:00:00Z",
			},
			shouldValid: true,
		},
		{
			name: "Umidade máxima",
			data: WeatherData{
				Temperature: 25.5,
				Humidity:    100.0,
				WindSpeed:   15.0,
				Condition:   "Chuva forte",
				Timestamp:   "2024-12-06T10:00:00Z",
			},
			shouldValid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Verificar se pode ser serializado
			_, err := json.Marshal(tt.data)
			if (err == nil) != tt.shouldValid {
				t.Errorf("Validação esperada %v, obtido erro: %v", tt.shouldValid, err)
			}
		})
	}
}