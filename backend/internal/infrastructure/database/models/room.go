package models

import "time"

type CreateStreamRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type CreateStreamResponse struct {
	Id string `json:"id"`
}

type StreamInfo struct {
	Id           string        `json:"id"`
	Name         string        `json:"name"`
	StreamerInfo BaseUserModel `json:"streamerInfo"`
	Description  string        `json:"description"`
	CreatedAt    time.Time     `json:"createdAt"`
	IsLive       bool          `json:"isLive"`
	IsStreamer   bool          `json:"isStreamer"`
}

type StreamMessage struct {
	Id        int    `json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UserId    string `json:"userId"`
	Username  string `json:"username"`
	Message   string `json:"message"`
}

type StreamData struct {
	StreamInfo StreamInfo      `json:"streamInfo"`
	Messages   []StreamMessage `json:"messages"`
}

type CreateTokenRequest struct {
	StreamId string `json:"streamId"`
}

type TokenResponse struct {
	Token string `json:"token"`
}
