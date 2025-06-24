package repositories

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/xddpprog/internal/infrastructure/database/models"
)

type StreamRepository struct {
	DB *pgxpool.Pool
}

// func (repo *StreamRepository) CheckStreamIsLive(ctx context.Context, streamId string) (*bool, error) {
// 	var isLive bool

// 	query := `SELECT is_live FROM streams WHERE id = $1 `
// 	err := repo.DB.QueryRow(ctx, query, streamId).Scan(&isLive)

// 	if err != nil {
// 		return nil, err
// 	}
// 	return &isLive, nil
// }

func (repo *StreamRepository) GetStreamInfo(ctx context.Context, streamId string) (*models.StreamInfo, error) {
	var streamInfo models.StreamInfo

	query := `
		SELECT s.id, s.name, s.description, s.is_live, u.id, u.username FROM streams s
		JOIN users u ON s.user_id = u.id
		WHERE s.id = $1
	`
	err := repo.DB.QueryRow(ctx, query, streamId).Scan(
		&streamInfo.Id, &streamInfo.Name, &streamInfo.Description,
		&streamInfo.IsLive, &streamInfo.StreamerInfo.Id, &streamInfo.StreamerInfo.Username,
	)

	if err != nil {
		return nil, err
	}
	return &streamInfo, nil
}

func (repo *StreamRepository) CreateStream(ctx context.Context, name string, description string, userId int) (string, error) {
	var streamId string

	query := `
		INSERT INTO streams (name, description, user_id) VALUES ($1, $2, $3)
		RETURNING id
	`
	err := repo.DB.QueryRow(ctx, query, name, description, userId).Scan(&streamId)
	if err != nil {
		return "", err
	}
	return streamId, nil
}

func (repo *StreamRepository) GetMessages(context context.Context, streamName string) ([]models.StreamMessage, error) {
	var messages []models.StreamMessage

	query := `
		SELECT m.id, m.message, m.created_at, u.username, u.id FROM messages m
		JOIN users u ON m.user_id = u.id
		WHERE m.stream_id = $1
		ORDER BY m.created_at ASC
	`
	rows, err := repo.DB.Query(context, query, streamName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var message models.StreamMessage
		if err := rows.Scan(
			&message.Id,
			&message.Message,
			&message.CreatedAt,
			&message.Username,
			&message.UserId,
		); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	return messages, nil
}
