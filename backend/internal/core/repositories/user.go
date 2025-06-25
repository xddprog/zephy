package repositories

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/xddpprog/internal/infrastructure/database/models"
)

type UserRepository struct {
	DB *pgxpool.Pool
}

func (repo *UserRepository) GetUserByEmail(ctx context.Context, value string) (*models.UserModel, error) {
	var user models.UserModel

	err := repo.DB.QueryRow(ctx, "SELECT id, username, email, password FROM users WHERE email = $1", value).Scan(
		&user.Id, &user.Username, &user.Email, &user.Password,
	)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (repo *UserRepository) GetUserById(ctx context.Context, userId string) (*models.BaseUserModel, error) {
	var user models.BaseUserModel

	err := repo.DB.QueryRow(ctx, "SELECT id, username, email FROM users WHERE id = $1", userId).Scan(
		&user.Id, &user.Username, &user.Email,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (repo *UserRepository) CreateUser(ctx context.Context, userForm models.RegisterUserModel) (*models.BaseUserModel, error) {
	var user models.BaseUserModel

	err := repo.DB.QueryRow(
		ctx,
		"INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
		userForm.Username, userForm.Email, userForm.Password,
	).Scan(&user.Id, &user.Username, &user.Email)

	if err != nil {
		return nil, err
	}
	return &user, nil
}
