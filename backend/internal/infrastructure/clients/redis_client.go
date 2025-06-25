package clients

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/xddpprog/internal/infrastructure/config"
)


type RedisClient struct {
	client *redis.Client
}


func NewRedisClient() *RedisClient {
	cfg := config.LoadRedisConfig()
	client := redis.NewClient(&redis.Options{
		Addr: cfg.GetAddress(),
		PoolSize: cfg.PoolSize,
		DB: cfg.DB,
	})
	return &RedisClient{client: client}
}


func (r *RedisClient) Set(ctx context.Context, key string, value any, exp time.Duration) error {
	err := r.client.Set(ctx, key, value, exp).Err()
	if err != nil {
		return err
	}
	return nil
}

func (r *RedisClient) GetString(ctx context.Context, key string) (string, error) {
	item, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", nil
		}
		return "", err
	}
	return item, nil
}