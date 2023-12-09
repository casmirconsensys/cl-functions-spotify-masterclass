const { types } = require("hardhat/config")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")

task("functions-initialize-playlist", "Seed RecordLabel with Playlist Data")
  .addParam("clientContract", "Contract address for RecordLabel")
  .setAction(async (taskArgs) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local hardhat chain.  Specify a valid network or simulate a RecordLabel request locally with "npx hardhat functions-simulate".'
      )
    }
    const recordLabelAddress = taskArgs.clientContract

    if (!ethers.utils.isAddress(recordLabelAddress))
      throw Error("Please provide a valid contract address for the SimpleStableCoin contract")

    const requestConfig = require("../../Functions-request-config.js")
    const accounts = await ethers.getSigners()

    if (!accounts[1])
      throw new Error("Playlist Wallet Address missing - you may need to add a second private key to hardhat config.")

    // Pretend your second wallet address is the Playlist's wallet, and setup PlaylistData on RecordLabel to point to your address.
    const playlistAddress = accounts[1].address // This pretends your deployer wallet is the playlist's.

    if (!playlistAddress || !ethers.utils.isAddress(playlistAddress)) {
      throw new Error("Invalid Second Wallet Address. Please check SECOND_PRIVATE_KEY in env vars.")
    }

    const [playlistId, playlistName, playlistListenerCount, playlistEmail] = requestConfig.args
    console.log(
      "\n Adding following playlist data to RecordLabel: ",
      playlistId,
      playlistName,
      playlistListenerCount,
      playlistEmail
    )

    const clientContractFactory = await ethers.getContractFactory("RecordLabel")
    const clientContract = await clientContractFactory.attach(recordLabelAddress)

    try {
      const setPlaylistDataTx = await clientContract.setPlaylistData(
        playlistId,
        playlistName,
        playlistEmail,
        playlistListenerCount,
        0, //last paid amount: 18 decimal places
        0, // total paid till date: 18 decimal places
        playlistAddress
      )
      await setPlaylistDataTx.wait(1)
    } catch (error) {
      console.log(
        `\nError writing playlist data for ${playlistId} at address ${playlistAddress} to the Record Label: ${error}`
      )
      throw error
    }

    console.log(
      `\nSeeded initial Playlist Data for ${playlistName} and assigned them wallet address ${playlistAddress}.`
    )
  })
