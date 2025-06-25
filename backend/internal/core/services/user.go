package services

import (
	"context"

	"github.com/xddpprog/internal/core/repositories"
	"github.com/xddpprog/internal/infrastructure/database/models"
	apierrors "github.com/xddpprog/internal/infrastructure/errors"
)

type UserService struct {
	Repository *repositories.UserRepository
}

func (s *UserService) GetUserById(ctx context.Context, userId string) (*models.BaseUserModel, *apierrors.APIError) {
	user, err := s.Repository.GetUserById(ctx, userId)
	if err != nil {
		return nil, apierrors.CheckDBError(err, "user")
	}
	return user, nil
}
