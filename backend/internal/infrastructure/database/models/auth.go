package models

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}


type AuthResponseModel struct {
	TokenPair
	User BaseUserModel `json:"user"`
}


type LoginUserModel struct {
	Email 	 string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}


type RegisterUserModel struct {
	LoginUserModel
	Username string `json:"username" validate:"required,min=8"`
}
