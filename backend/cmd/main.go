package main

import (
	"log"
	"net/http"

	deps "github.com/xddpprog/internal/handlers/dependencies"
	"github.com/xddpprog/internal/handlers/setup"
	"github.com/xddpprog/internal/handlers/v1"
	"github.com/xddpprog/internal/infrastructure/database/connections"
	"github.com/xddpprog/internal/middlewares"
)

func main() {
	db, err := connections.NewPostgresConnection()
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	userHandler, _ := setup.InitNewHandler(&handlers.UserHandler{}, db)
	authHandler, _ := setup.InitNewHandler(&handlers.AuthHandler{}, db)
	streamHandler, _ := setup.InitNewHandler(&handlers.StreamHandler{}, db)

	authDependency := deps.NewAuthDependency(authHandler.Service)

	userHandler.SetupRoutes(mux, "/api/v1", authDependency)
	authHandler.SetupRoutes(mux, "/api/v1", authDependency)
	streamHandler.SetupRoutes(mux, "/api/v1", authDependency)

	server := middlewares.EnableCORS(mux)

	http.ListenAndServe("localhost:8000", server)
}
