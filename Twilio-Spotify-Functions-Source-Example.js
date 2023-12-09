// This example shows how to make a fetch playlist monthly listener counts and trigger an email if
// the playlist is due a payment for every additional 1000 streams.

// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below
const playlistId = args[0]
const playlistName = args[1]
const lastListenerCount = parseInt(args[2])
const artistEmail = args[3]
const VERIFIED_SENDER = args[4]

// Ref: https://doc.api.soundcharts.com/api/v2/doc/reference/path/playlist/get-latest-spotify-monthly-listeners
const URL = `https://customer.api.soundcharts.com/api/v2/playlist/${playlistId}/streaming/spotify/listeners`

// Get Listener Count Data.
if (!playlistId) {
  throw new Error("No playlistId provided.")
} else {
  console.log("playlist ID:", playlistId)
}

if (isNaN(lastListenerCount)) {
  throw new Error(`Listener Count is NaN: ${lastListenerCount}`)
} else {
  console.log("Last Listener Count:", lastListenerCount)
}
// TODO #2: Implement logic to calculate payment due
// Calculate latest listener counts and whether payments are due.
const latestListenerCount = await getLatestMonthlyListenerCount()
console.log(latestListenerCount)

const diffListenerCount = latestListenerCount - lastListenerCount
console.log(diffListenerCount)

if (latestListenerCount > lastListenerCount) {
  const amountDue = diffListenerCount / 1_000 // playlist gets 1 STC per 1_000 additional streams.
  console.log(
    `\nPlaylist is due payments of ${amountDue} STC for an additional ${diffListenerCount.toLocaleString()} listeners...`
  )

  await sendEmail(latestListenerCount, amountDue) // Not implemented yet - assignment!
} else {
  console.log("\nPlaylist is not due additional payments...")
}

return Buffer.concat([
  Functions.encodeInt256(latestListenerCount),
  Functions.encodeInt256(diffListenerCount)
])

// ====================
// Helper Functions
// ====================
async function getLatestMonthlyListenerCountWithRetry() {
  let retries = 3
  while (retries > 0) {
    try {
      const soundchartsResponse = await Functions.makeHttpRequest({
        /*...*/
      })
      // Process response...
      return
    } catch (error) {
      console.error("Error fetching playlist data:", error)
      retries--
      if (retries === 0) {
        throw new Error("Exhausted retry attempts.")
      }
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait for 3 seconds before retrying
    }
  }
}

// Use Twilio Sendgrid API to send emails.
// https://sendgrid.com/solutions/email-api
async function sendEmail(latestListenerCount, amountDue) {
  if (!secrets.twilioApiKey) {
    return
  }
  // TODO #3: Your Stretch Assignment!
}
async function processPlaylistData() {
  try {
    const latestListenerCount = await getLatestMonthlyListenerCount()
    const diffListenerCount = latestListenerCount - lastListenerCount

    if (latestListenerCount > lastListenerCount) {
      const amountDue = diffListenerCount / 1000
      console.log(
        `\nPlaylist is due payments of ${amountDue} STC for an additional ${diffListenerCount.toLocaleString()} listeners...`
      )

      await sendEmail(latestListenerCount, amountDue)
    } else {
      console.log("\nPlaylist is not due additional payments...")
    }

    return Buffer.concat([Functions.encodeInt256(latestListenerCount), Functions.encodeInt256(diffListenerCount)])
  } catch (error) {
    console.error("An error occurred while processing playlist data:", error)
    throw error
  }
}

processPlaylistData()
