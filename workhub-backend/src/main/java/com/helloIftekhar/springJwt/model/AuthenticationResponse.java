package com.helloIftekhar.springJwt.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.helloIftekhar.springJwt.DTO.UserDto;

public class AuthenticationResponse {
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("message")
    private String message;

    @JsonProperty("user")
    private UserDto user;

    public AuthenticationResponse(String accessToken, String refreshToken, String message) {
        this.accessToken = accessToken;
        this.message = message;
        this.refreshToken = refreshToken;
    }

    public AuthenticationResponse(String accessToken, String refreshToken, String message, UserDto user) {
        this.accessToken = accessToken;
        this.message = message;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getMessage() {
        return message;
    }

    public UserDto getUser() {
        return user;
    }
}
