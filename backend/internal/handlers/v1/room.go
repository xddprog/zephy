package handlers

import (
	"net/http"

	"github.com/xddpprog/internal/core/services"
	deps "github.com/xddpprog/internal/handlers/dependencies"
	"github.com/xddpprog/internal/infrastructure/database/models"
	apierrors "github.com/xddpprog/internal/infrastructure/errors"
	"github.com/xddpprog/internal/utils"
)

type StreamHandler struct {
	StreamService *services.StreamService
}

func (handler *StreamHandler) CreateStream(response http.ResponseWriter, request *http.Request, user *models.BaseUserModel) {
	stream, err := handler.StreamService.CreateStream(request.Context(), request.Body, user.Id)
	if err != nil {
		apierrors.WriteHTTPError(response, err)
		return
	}
	utils.WriteJSONResponse(response, http.StatusCreated, stream)
}

func (handler *StreamHandler) CreateToken(response http.ResponseWriter, request *http.Request, user *models.BaseUserModel) {
	token, err := handler.StreamService.CreateToken(request.Context(), request.Body, user.Id)
	if err != nil {
		apierrors.WriteHTTPError(response, err)
		return
	}
	utils.WriteJSONResponse(response, http.StatusOK, token)
}

func (handler *StreamHandler) GetStreamMessages(response http.ResponseWriter, request *http.Request, user *models.BaseUserModel) {
	streamName := request.PathValue("streamId")
	if streamName == "" {
		apierrors.WriteHTTPError(response, &apierrors.ErrInvalidRequestBody)
		return
	}

	messages, err := handler.StreamService.GetStreamMessages(request.Context(), streamName)
	if err != nil {
		apierrors.WriteHTTPError(response, err)
		return
	}

	utils.WriteJSONResponse(response, http.StatusOK, messages)
}

func (handler *StreamHandler) GetStreamInfo(response http.ResponseWriter, request *http.Request, user *models.BaseUserModel) {
	streamId := request.PathValue("streamId")
	streamInfo, err := handler.StreamService.GetStreamInfo(request.Context(), request.Body, user.Id, streamId)
	if err != nil {
		apierrors.WriteHTTPError(response, err)
		return
	}

	utils.WriteJSONResponse(response, http.StatusOK, streamInfo)
}

func (handler *StreamHandler) SetupRoutes(server *http.ServeMux, baseUrl string, authDeps *deps.AuthDependency) {
	server.HandleFunc("POST "+baseUrl+"/stream", authDeps.Protected(handler.CreateStream))
	server.HandleFunc("POST "+baseUrl+"/stream/token", authDeps.Protected(handler.CreateToken))
	server.HandleFunc("GET "+baseUrl+"/stream/{streamId}", authDeps.Protected(handler.GetStreamInfo))
	server.HandleFunc("GET "+baseUrl+"/stream/{streamId}/messages", authDeps.Protected(handler.GetStreamMessages))

}
