const fs = require("fs")

// Loads environment variables from .env.enc file (if it exists)
require("@chainlink/env-enc").config()

// Soundchart Playlist UuIDs for sandbox are available from https://doc.api.soundcharts.com/api/v2/doc/sandbox-data

const NEW_MUSIC_FRIDAY = "11e84493-4135-a14e-bca2-a0369fe50396"

const ALL_GROWN_UP = "86694fd0-cdce-11e8-8cff-549f35161576"

const Location = {
  Inline: 0,
  Remote: 1,
}

const CodeLanguage = {
  JavaScript: 0,
}

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
}

// Configure the request by setting the fields below
const requestConfig = {
  codeLocation: Location.Inline,

  codeLanguage: CodeLanguage.JavaScript,

  source: fs.readFileSync("./Twilio-Spotify-Functions-Source-Example.js").toString(),

  walletPrivateKey: process.env["PRIVATE_KEY"],

  args: [
    NEW_MUSIC_FRIDAY,
    "New Music Friday",
    "14000000", // 14 million
    process.env.ARTIST_EMAIL || "founder@nftyco.com",
    // Uncomment the below when you have set these env vars
    //   process.env.VERIFIED_SENDER,
  ],

  expectedReturnType: ReturnType.int256,

  secretsURLs: [],

  secrets: {
    soundchartAppId: process.env.SOUNDCHART_APP_ID,
    soundchartApiKey: process.env.SOUNDCHART_API_KEY,
    mailgunApiKey: process.env.MAILGUN_API_KEY,
  },

  perNodeSecrets: [
    {
      soundchartAppId: process.env.SOUNDCHART_APP_ID,
      soundchartApiKey: process.env.SOUNDCHART_API_KEY,
      mailgunApiKey: process.env.MAILGUN_API_KEY,
    },

    {
      soundchartAppId: process.env.SOUNDCHART_APP_ID,
      soundchartApiKey: process.env.SOUNDCHART_API_KEY,
      mailgunApiKey: "",
    },

    {
      soundchartAppId: process.env.SOUNDCHART_APP_ID,
      soundchartApiKey: process.env.SOUNDCHART_API_KEY,
      mailgunApiKey: "",
    },

    {
      soundchartAppId: process.env.SOUNDCHART_APP_ID,
      soundchartApiKey: process.env.SOUNDCHART_API_KEY,
      mailgunApiKey: "",
    },
  ],
}

module.exports = requestConfig
