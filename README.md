# nodeDiscordBot

Generate your config.json file

```json
{
  "discord": {
    "token": "Your discord bot token",
    "channels": {
      "log": "Channel id for log",
      "infoLaunch": "Channel id for info launch message",
      "nasaApod": "Channel id for daily nasa apod",
      "welcome": "Channel id for new and remove guild member"
    },
    "roles": {
      "launchInformation": "Role id for ping when new launch incoming",
      "apod": "Role id for ping @ 9h for new nasa apod"
    },
    "botId": "Your bot id",
    "ownerId": "Your id"
  },
  "db": {
    "mongoUri": "Your mongo db URI"
  },
  "nasa": {
    "apiKey": "Your nasa api key"
  }
}

```