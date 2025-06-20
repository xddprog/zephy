package connections

import (
	"github.com/redis/go-redis/v9"
	
	"github.com/xddpprog/internal/infrastructure/config"
)


func NewRedisConnection() *redis.Client {
	redisCfg := config.LoadRedisConfig()
	return redis.NewClient(&redis.Options{
		Addr: redisCfg.GetAddress(),
		DB: redisCfg.DB,
		PoolSize: redisCfg.PoolSize,
	})
}