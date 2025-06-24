package handlers

import (
	"net/http"
	"strconv"

	"github.com/xddpprog/internal/core/services"
	deps "github.com/xddpprog/internal/handlers/dependencies"
	"github.com/xddpprog/internal/infrastructure/database/models"
	apierrors "github.com/xddpprog/internal/infrastructure/errors"
	"github.com/xddpprog/internal/utils"
)


type UserHandler struct {
	UserService *services.UserService
}


func (handler *UserHandler) GetUserById(response http.ResponseWriter, request *http.Request, user *models.BaseUserModel) {
	response.Header().Set("Content-Type", "application/json")

	userId, err := strconv.Atoi(request.PathValue("id"))
	if err != nil {
		apierrors.WriteHTTPError(response, err)
		return
	}

	userGet, serviceErr := handler.UserService.GetUserById(request.Context(), userId)
	if serviceErr != nil {
		apierrors.WriteHTTPError(response, serviceErr)
		return
	}

	utils.WriteJSONResponse(response, http.StatusOK, userGet)
}

func (handler *UserHandler) SetupRoutes(server *http.ServeMux, baseUrl string, authDeps *deps.AuthDependency) {
	server.HandleFunc("GET " + baseUrl+ "/user/{id}", authDeps.Protected(handler.GetUserById))
}