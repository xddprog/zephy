package types

import (
	"net/http"

	deps "github.com/xddpprog/internal/handlers/dependencies"
)


type HandlerInterface interface {
	SetupRoutes(server *http.ServeMux, baseUrl string, protected *deps.AuthDependency)
}


