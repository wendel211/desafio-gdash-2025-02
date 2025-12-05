package main

type WeatherMessage struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"wind_speed"`
	Condition   string  `json:"condition"`
	Timestamp   string  `json:"timestamp"`
}
