package services

import (
	"context"
	"encoding/json"
	"io"
	"log"

	"github.com/xddpprog/internal/core/repositories"
	"github.com/xddpprog/internal/infrastructure/clients"
	"github.com/xddpprog/internal/infrastructure/database/models"
	apierrors "github.com/xddpprog/internal/infrastructure/errors"
)

type StreamService struct {
	Repository    *repositories.StreamRepository
	LivekitClient clients.LivekitClient
	RedisClient   clients.RedisClient
}

func (service *StreamService) GetStreamInfo(ctx context.Context, body io.ReadCloser, userId string, streamId string) (*models.StreamInfo, *apierrors.APIError) {
	streamInfo, err := service.Repository.GetStreamInfo(ctx, streamId)
	if err != nil {
		return nil, apierrors.CheckDBError(err, "stream")
	}
	streamInfo.IsStreamer = streamInfo.StreamerInfo.Id == userId

	err = service.LivekitClient.AddChatHandler(ctx, streamId, userId, service.Repository.CreateMessage)
	if err != nil {
		log.Printf("error add chat handler: %v", err)
	}
	return streamInfo, nil
}

func (service *StreamService) GetStreamMessages(context context.Context, streamName string) ([]models.StreamMessage, *apierrors.APIError) {
	messages, err := service.Repository.GetMessages(context, streamName)
	if err != nil {
		return messages, apierrors.CheckDBError(err, "message")
	}
	return messages, nil
}

func (service *StreamService) CreateToken(context context.Context, form io.ReadCloser, userId string) (*models.TokenResponse, *apierrors.APIError) {
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
		userId,
	)

	if err != nil {
		return nil, &apierrors.ErrFailedToCreateToken
	}

	return &models.TokenResponse{Token: token}, nil
}

func (service *StreamService) CreateStream(ctx context.Context, form io.Reader, userId string) (*models.CreateStreamResponse, *apierrors.APIError) {
	var createStreamRequest models.CreateStreamRequest

	if err := json.NewDecoder(form).Decode(&createStreamRequest); err != nil {
		return nil, &apierrors.ErrInvalidRequestBody
	}

	streamId, err := service.Repository.CreateStream(
		ctx, createStreamRequest.Name, createStreamRequest.Description, userId,
	)
	if err != nil {
		return nil, apierrors.CheckDBError(err, "stream")
	}

	err = service.LivekitClient.AddChatHandler(ctx, streamId, userId, service.Repository.CreateMessage)
	if err != nil {
		log.Printf("error add chat handler: %v", err)
	}

	_, err = service.LivekitClient.CreateNewStream(ctx, streamId, userId, service.Repository.CreateMessage)
	if err != nil {
		log.Printf("failed to create stream: %v", err)
		return nil, &apierrors.ErrFailedToCreateStream
	}
	return &models.CreateStreamResponse{Id: streamId}, nil
}
