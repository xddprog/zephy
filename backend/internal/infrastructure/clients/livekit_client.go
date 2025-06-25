package clients

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	lkauth "github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
	"github.com/xddpprog/internal/infrastructure/config"
	"github.com/xddpprog/internal/infrastructure/database/models"
)

type MessageHandler func(ctx context.Context, streamId string, userId string, message string) (*models.StreamMessage, error)

type LivekitClient struct {
	ApiKey       string
	ApiSecret    string
	Url          string
	StreamClient *lksdk.RoomServiceClient
}

func NewLivekitClient() *LivekitClient {
	cfg := config.LoadLivekitConfig()
	return &LivekitClient{
		ApiKey:       cfg.ApiKey,
		ApiSecret:    cfg.ApiSecret,
		Url:          cfg.LivekitHost,
		StreamClient: lksdk.NewRoomServiceClient(cfg.LivekitHost, cfg.ApiKey, cfg.ApiSecret),
	}
}

func (client *LivekitClient) CreateNewStream(ctx context.Context, streamId string, userId string, messageHandler MessageHandler) (*livekit.Room, error) {
	stream, err := client.StreamClient.CreateRoom(ctx, &livekit.CreateRoomRequest{Name: streamId})
	if err != nil {
		return nil, err
	}

	return stream, err
}

func (client *LivekitClient) AddChatHandler(ctx context.Context, streamId string, userId string, messageHandler MessageHandler) error {
	sessionId := fmt.Sprintf("%d", time.Now().UnixNano())
	uniqueIdentity := fmt.Sprintf("%s:%s", userId, sessionId)
	stream, err := lksdk.ConnectToRoom(client.Url, lksdk.ConnectInfo{
		APIKey:              client.ApiKey,
		RoomName:            streamId,
		APISecret:           client.ApiSecret,
		ParticipantIdentity: uniqueIdentity,
	}, lksdk.NewRoomCallback())
	
	if err != nil {
		log.Printf("failed connect to room: %v", err)
		return err
	}

	stream.RegisterTextStreamHandler(streamId, func(reader *lksdk.TextStreamReader, participantIdentity string) {
		rawMessage := reader.ReadAll()

		var incomingMsg struct {
			Message  string `json:"message"`
			UserID   string `json:"userId"`
			Username string `json:"username"`
		}

		if err := json.Unmarshal([]byte(rawMessage), &incomingMsg); err != nil {
			log.Printf("error decoding JSON message: %v", err)
			return
		}

		messageDB, err := messageHandler(context.Background(), streamId, incomingMsg.UserID, incomingMsg.Message)
		if err != nil {
			log.Printf("create message error: %v", err)
			return
		}

		messageDB.Username = incomingMsg.Username
		msg, err := json.Marshal(messageDB)
		if err != nil {
			log.Printf("error encode message: %v", err)
		}

		err = stream.LocalParticipant.PublishData(msg, lksdk.WithDataPublishTopic(streamId))
		if err != nil {
			log.Printf("error send message to client: %v", err)
		}
		log.Printf("send message: %+v", messageDB)
	})
	return nil
}

func (client *LivekitClient) GetStream(context context.Context, streamName string) (*livekit.Room, error) {
	r, err := client.StreamClient.ListRooms(context, &livekit.ListRoomsRequest{
		Names: []string{streamName},
	})

	if err != nil {
		return nil, err
	}
	if len(r.Rooms) == 0 {
		return nil, nil
	}
	return r.Rooms[0], nil
}

func (client *LivekitClient) CreateToken(context context.Context, streamName string, isStreamer bool, identity string) (string, error) {
	canSubscribe := true
	grant := &lkauth.VideoGrant{
		RoomJoin:     true,
		Room:         streamName,
		CanPublish:   &isStreamer,
		CanSubscribe: &canSubscribe,
	}

	token := lkauth.NewAccessToken(client.ApiKey, client.ApiSecret)
	token.SetVideoGrant(grant).SetIdentity(identity)
	return token.ToJWT()
}

func (client *LivekitClient) DeleteStream(context context.Context, streamName string) error {
	_, err := client.StreamClient.DeleteRoom(context, &livekit.DeleteRoomRequest{
		Room: streamName,
	})
	return err
}