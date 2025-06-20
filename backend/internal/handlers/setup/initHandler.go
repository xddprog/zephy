package setup

import (
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/xddpprog/internal/core/repositories"
	"github.com/xddpprog/internal/core/services"
	"github.com/xddpprog/internal/handlers/v1"
	"github.com/xddpprog/internal/infrastructure/config"
	"github.com/xddpprog/internal/infrastructure/types"
)


func InitNewHandler[T types.HandlerInterface](emptyHandler T, db *pgxpool.Pool) (T, error) {
	switch h := any(emptyHandler).(type) {
	case *handlers.UserHandler:
		userRepository := &repositories.UserRepository{DB: db}

		userService := &services.UserService{Repository: userRepository}
		
		*h = handlers.UserHandler{UserService: userService}
		return any(h).(T), nil
		
	case *handlers.AuthHandler:		
		cfg, err := config.LoadJwtConfig()
		if err != nil {
			panic(err)
		}
		
		repository := &repositories.UserRepository{DB: db}
		service := &services.AuthService{Repository: repository, Config: cfg}
		*h = handlers.AuthHandler{Service: service}
		return any(h).(T), nil
		
	default:
		return emptyHandler, fmt.Errorf("undefined handler type: %T", emptyHandler)
	}
}