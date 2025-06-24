package clients

import (
	"context"

	lkauth "github.com/livekit/protocol/auth"
	livekit "github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
	"github.com/xddpprog/internal/infrastructure/config"
)

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

func (client *LivekitClient) CreateNewStream(context context.Context, streamName string) (*livekit.Room, error) {
	stream, err := client.StreamClient.CreateRoom(context, &livekit.CreateRoomRequest{Name: streamName})
	if err != nil {
		return nil, err
	}
	return stream, err
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
		RoomJoin:   true,
		Room:       streamName,
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
