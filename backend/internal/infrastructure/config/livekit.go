package config

import (
	"os"

	"github.com/joho/godotenv"
)

type LivekitConfig struct {
	ApiKey      string
	ApiSecret   string
	LivekitHost string
}


func LoadLivekitConfig() (*LivekitConfig) {
	if err := godotenv.Load(); err != nil {
		panic("failed to load .env file")
	}
	
	return &LivekitConfig{
		ApiKey:      os.Getenv("LIVEKIT_API_KEY"),
		ApiSecret:   os.Getenv("LIVEKIT_API_SECRET"),
		LivekitHost: os.Getenv("LIVEKIT_HOST"),
	}
}
