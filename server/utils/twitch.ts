class twitchApi {
  clientId: string;
  clientSecret: string;
  API_BASE: string;
  OAUTH_BASE: string;
  constructor (clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.API_BASE = "https://api.twitch.tv/helix";
    this.OAUTH_BASE = "https://id.twitch.tv/oauth2";
  }

  async getAppAccessToken () {
    const { access_token } = await $fetch<{ access_token: string }>(`${this.OAUTH_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      query: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "client_credentials"
      }
    });
    // eslint-disable-next-line camelcase
    return access_token;
  }

  async getStreamByUserId (userId: string | number) {
    const accessToken = await this.getAppAccessToken();
    const { data } = await $fetch<{ data: any[] }>(`${this.API_BASE}/streams`, {
      query: {
        user_id: userId
      },
      headers: {
        "Client-Id": this.clientId,
        "Authorization": "Bearer " + accessToken
      }
    });
    return data?.[0];
  }
}

export default twitchApi;
