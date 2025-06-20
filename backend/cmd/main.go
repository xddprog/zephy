package main

import (
	"log"
	"net/http"

	deps "github.com/xddpprog/internal/handlers/dependencies"
	"github.com/xddpprog/internal/handlers/setup"
	"github.com/xddpprog/internal/handlers/v1"
	"github.com/xddpprog/internal/infrastructure/database/connections"
)


func main() {
	db, err := connections.NewPostgresConnection()
	if err != nil {
		log.Fatal(err)
	}

	server := http.NewServeMux()

	userHandler, _ := setup.InitNewHandler(&handlers.UserHandler{}, db)
	authHandler, _ := setup.InitNewHandler(&handlers.AuthHandler{}, db)
	
	authDependency := deps.NewAuthDependency(authHandler.Service)

	userHandler.SetupRoutes(server, "/api/v1", authDependency)
	authHandler.SetupRoutes(server, "/api/v1", authDependency)

	http.ListenAndServe("localhost:8000", server)
}
