// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tournament {
    struct TournamentInfo {
        string code;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 currentPlayers;
        bool isActive;
        mapping(address => uint256) playerScores;
        address[] players;
    }

    mapping(string => TournamentInfo) public tournaments;
    mapping(address => string) public playerActiveTournament;

    event TournamentCreated(string code, address creator, uint256 startTime, uint256 endTime);
    event PlayerJoined(string code, address player);
    event ScoreUpdated(string code, address player, uint256 score);
    event TournamentEnded(string code, address winner, uint256 score);

    function createTournament(string memory _code, uint256 _duration) public {
        require(tournaments[_code].creator == address(0), "Tournament code already exists");
        require(_duration > 0 && _duration <= 600, "Duration must be between 1 and 600 seconds");

        TournamentInfo storage tournament = tournaments[_code];
        tournament.code = _code;
        tournament.creator = msg.sender;
        tournament.startTime = block.timestamp;
        tournament.endTime = block.timestamp + _duration;
        tournament.currentPlayers = 0;
        tournament.isActive = true;

        emit TournamentCreated(_code, msg.sender, tournament.startTime, tournament.endTime);
    }

    function joinTournament(string memory _code) public {
        require(tournaments[_code].isActive, "Tournament not active");
        require(bytes(playerActiveTournament[msg.sender]).length == 0, "Player already in a tournament");
        require(block.timestamp < tournaments[_code].endTime, "Tournament has ended");

        TournamentInfo storage tournament = tournaments[_code];
        tournament.players.push(msg.sender);
        tournament.currentPlayers++;
        playerActiveTournament[msg.sender] = _code;

        emit PlayerJoined(_code, msg.sender);
    }

    function updateScore(uint256 _score) public {
        string memory tournamentCode = playerActiveTournament[msg.sender];
        require(bytes(tournamentCode).length > 0, "Player not in any tournament");
        require(tournaments[tournamentCode].isActive, "Tournament not active");
        require(block.timestamp < tournaments[tournamentCode].endTime, "Tournament has ended");

        TournamentInfo storage tournament = tournaments[tournamentCode];
        tournament.playerScores[msg.sender] = _score;

        emit ScoreUpdated(tournamentCode, msg.sender, _score);
    }

    function endTournament(string memory _code) public {
        require(tournaments[_code].isActive, "Tournament not active");
        require(block.timestamp >= tournaments[_code].endTime, "Tournament still in progress");
        require(msg.sender == tournaments[_code].creator, "Only creator can end tournament");

        TournamentInfo storage tournament = tournaments[_code];
        tournament.isActive = false;

        // Find winner
        address winner = address(0);
        uint256 highestScore = 0;

        for (uint i = 0; i < tournament.players.length; i++) {
            address player = tournament.players[i];
            if (tournament.playerScores[player] > highestScore) {
                highestScore = tournament.playerScores[player];
                winner = player;
            }
        }

        emit TournamentEnded(_code, winner, highestScore);
    }

    function getTournamentInfo(string memory _code) public view returns (
        address creator,
        uint256 startTime,
        uint256 endTime,
        uint256 currentPlayers,
        bool isActive
    ) {
        TournamentInfo storage tournament = tournaments[_code];
        return (
            tournament.creator,
            tournament.startTime,
            tournament.endTime,
            tournament.currentPlayers,
            tournament.isActive
        );
    }

    function getPlayerScore(string memory _code, address _player) public view returns (uint256) {
        return tournaments[_code].playerScores[_player];
    }

    function getTournamentPlayers(string memory _code) public view returns (address[] memory) {
        return tournaments[_code].players;
    }
} 