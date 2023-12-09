// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
// import "https://github.com/smartcontractkit/functions-hardhat-starter-kit/blob/main/contracts/dev/functions/FunctionsClient.sol";

import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStableCoin is IERC20 {
    function mint(address to, uint256 amount) external;

    function decimals() external returns (uint8);
}

contract RecordLabel is FunctionsClient, ConfirmedOwner {
    using Functions for Functions.Request;

    bytes32 public latestRequestId;
    bytes public latestResponse;
    bytes public latestError;
    string public latestPlaylistRequestedId;

    address public s_stc; // SimpleStableCoin address for payouts.

    error RecordLabel_PlaylistPaymentError(string playlistId, uint256 payment, string errorMsg);

    struct Playlist {
        string name;
        string email;
        string playlistId;
        uint256 lastListenerCount;
        uint256 lastPaidAmount;
        uint256 totalPaid;
        address walletAddress;
    }

    mapping(string => Playlist) playlistData;

    event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);
    event PlaylistPaid(string playlistId, uint256 amount);

    constructor(address oracle, address stablecoin) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
        s_stc = stablecoin;
    }

    function executeRequest(
        string calldata source,
        bytes calldata secrets,
        string[] calldata args,
        uint64 subscriptionId,
        uint32 gasLimit
    ) public onlyOwner returns (bytes32) {
        Functions.Request memory req;
        req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);

        if (secrets.length > 0) {
            req.addRemoteSecrets(secrets);
        }
        if (args.length > 0) req.addArgs(args);

        bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
        latestRequestId = assignedReqID;
        latestPlaylistRequestedId = args[0];
        return assignedReqID;
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        latestResponse = response;
        latestError = err;
        emit OCRResponse(requestId, response, err);

        bool nilErr = (err.length == 0);
        if (nilErr) {
            string memory playlistId = latestPlaylistRequestedId;
            (int256 latestListenerCount, int256 diffListenerCount) = abi.decode(response, (int256, int256));

            if (diffListenerCount <= 0) {
                return;
            }

            uint8 stcDecimals = IStableCoin(s_stc).decimals();
            uint256 amountDue = (uint256(diffListenerCount) * 1 * 10 ** stcDecimals) / 10000;

            payPlaylist(playlistId, amountDue);

            playlistData[playlistId].lastListenerCount = uint256(latestListenerCount);
            playlistData[playlistId].lastPaidAmount = amountDue;
            playlistData[playlistId].totalPaid += amountDue;
        }
    }

    function setPlaylistData(
        string memory playlistId,
        string memory name,
        string memory email,
        uint256 lastListenerCount,
        uint256 lastPaidAmount,
        uint256 totalPaid,
        address walletAddress
    ) public onlyOwner {
        playlistData[playlistId] = Playlist({
            name: name,
            email: email,
            playlistId: playlistId,
            lastListenerCount: lastListenerCount,
            lastPaidAmount: lastPaidAmount,
            totalPaid: totalPaid,
            walletAddress: walletAddress
        });
    }

    function payPlaylist(string memory playlistId, uint256 amountDue) internal {
        IStableCoin token = IStableCoin(s_stc);
        if (playlistData[playlistId].walletAddress == address(0)) {
            revert RecordLabel_PlaylistPaymentError(playlistId, amountDue, "Playlist has no wallet associated.");
        }

        token.transferFrom(owner(), playlistData[playlistId].walletAddress, amountDue);
        emit PlaylistPaid(playlistId, amountDue);
    }

    function getPlaylistData(string memory playlistId) public view returns (Playlist memory) {
        return playlistData[playlistId];
    }

    function updateOracleAddress(address oracle) public onlyOwner {
        setOracle(oracle);
    }

    function updateStableCoinAddress(address stc) public onlyOwner {
        s_stc = stc;
    }

    function addSimulatedRequestId(address oracleAddress, bytes32 requestId) public onlyOwner {
        addExternalRequest(oracleAddress, requestId);
    }
}
