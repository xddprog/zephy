package services

import (
	"context"
	"encoding/json"
	"io"

	"github.com/xddpprog/internal/core/repositories"
	"github.com/xddpprog/internal/infrastructure/clients"
	"github.com/xddpprog/internal/infrastructure/database/models"
	apierrors "github.com/xddpprog/internal/infrastructure/errors"
	"github.com/xddpprog/internal/utils"
)

type StreamService struct {
	Repository    *repositories.StreamRepository
	LivekitClient clients.LivekitClient
}

func (service *StreamService) GetStreamInfo(context context.Context, body io.ReadCloser, userId int, streamId string) (*models.StreamInfo, *apierrors.APIError) {
	streamInfo, err := service.Repository.GetStreamInfo(context, streamId)
	if err != nil {
		return nil, apierrors.CheckDBError(err, "stream")
	}
	streamInfo.IsStreamer = streamInfo.StreamerInfo.Id == userId
	return streamInfo, nil
}

func (service *StreamService) GetStreamMessages(context context.Context, streamName string) ([]models.StreamMessage, *apierrors.APIError) {
	messages, err := service.Repository.GetMessages(context, streamName)
	if err != nil {
		return messages, apierrors.CheckDBError(err, "message")
	}
	return messages, nil
}

func (service *StreamService) CreateToken(context context.Context, form io.ReadCloser, userId int, username string) (*models.TokenResponse, *apierrors.APIError) {
	var createTokenRequest models.CreateTokenRequest

	if err := json.NewDecoder(form).Decode(&createTokenRequest); err != nil {
		return nil, &apierrors.ErrInvalidRequestBody
	}

	streamInfo, err := service.Repository.GetStreamInfo(context, createTokenRequest.StreamId)
	if err != nil {
		return nil, apierrors.CheckDBError(err, "stream")
	}

	streamInfo.IsStreamer = streamInfo.StreamerInfo.Id == userId
	if !streamInfo.IsLive {
		return nil, &apierrors.ErrStreamIsNotLive
	}

	token, err := service.LivekitClient.CreateToken(
		context,
		streamInfo.Id,
		streamInfo.IsStreamer,
		username,
	)

	if err != nil {
		return nil, &apierrors.ErrFailedToCreateToken
	}

	return &models.TokenResponse{Token: token}, nil
}

func (service *StreamService) CreateStream(ctx context.Context, form io.Reader, userId int) (*models.CreateStreamResponse, *apierrors.APIError) {
	var createStreamRequest models.CreateStreamRequest

	if err := json.NewDecoder(form).Decode(&createStreamRequest); err != nil {
		return nil, &apierrors.ErrInvalidRequestBody
	}

	if err := utils.ValidateForm(createStreamRequest); err != nil {
		return nil, err
	}

	streamId, err := service.Repository.CreateStream(
		ctx, createStreamRequest.Name, createStreamRequest.Description, userId,
	)
	if err != nil {
		return nil, apierrors.CheckDBError(err, "stream")
	}

	_, err = service.LivekitClient.CreateNewStream(ctx, streamId)
	if err != nil {
		return nil, &apierrors.ErrFailedToCreateStream
	}
	return &models.CreateStreamResponse{Id: streamId}, nil
}
