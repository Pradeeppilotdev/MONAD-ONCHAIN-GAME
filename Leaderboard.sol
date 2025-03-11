// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Leaderboard {
    // Events
    event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);
    event NewHighScore(address indexed player, uint256 score);

    // Structs
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    // State variables
    Score[] public allScores;
    mapping(address => uint256) public highScores;
    mapping(address => Score[]) public playerScores;
    uint256 public totalPlayers;
    
    // Submit a new score
    function submitScore(uint256 _score) public {
        require(_score > 0, "Score must be greater than 0");
        
        // Create new score
        Score memory newScore = Score({
            player: msg.sender,
            score: _score,
            timestamp: block.timestamp
        });
        
        // Add to all scores
        allScores.push(newScore);
        
        // Add to player's scores
        playerScores[msg.sender].push(newScore);
        
        // Update high score if necessary
        if (_score > highScores[msg.sender]) {
            highScores[msg.sender] = _score;
            emit NewHighScore(msg.sender, _score);
        }
        
        // Update total players if this is their first score
        if (playerScores[msg.sender].length == 1) {
            totalPlayers++;
        }
        
        emit ScoreSubmitted(msg.sender, _score, block.timestamp);
    }

    // Get top 100 scores
    function getTopScores() public view returns (Score[] memory) {
        uint256 length = allScores.length;
        
        // If no scores, return empty array
        if (length == 0) {
            return new Score[](0);
        }
        
        // Determine result length (up to 100)
        uint256 resultLength = length < 100 ? length : 100;
        
        // Create temporary array for sorting
        Score[] memory sortedScores = new Score[](length);
        for (uint256 i = 0; i < length; i++) {
            sortedScores[i] = allScores[i];
        }
        
        // Sort scores (bubble sort)
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (sortedScores[j].score < sortedScores[j + 1].score) {
                    Score memory temp = sortedScores[j];
                    sortedScores[j] = sortedScores[j + 1];
                    sortedScores[j + 1] = temp;
                }
            }
        }
        
        // Create result array with top scores
        Score[] memory result = new Score[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = sortedScores[i];
        }
        
        return result;
    }

    // Get player's rank
    function getUserRank(address _player) public view returns (uint256) {
        uint256 playerHighScore = highScores[_player];
        
        // If player has no score, return last rank
        if (playerHighScore == 0) {
            return totalPlayers > 0 ? totalPlayers + 1 : 1;
        }
        
        uint256 rank = 1;
        
        // Count how many players have higher scores
        for (uint256 i = 0; i < allScores.length; i++) {
            if (allScores[i].score > playerHighScore) {
                rank++;
            }
        }
        
        return rank;
    }

    // Get player's high score
    function getHighScore(address _player) public view returns (uint256) {
        return highScores[_player];
    }

    // Get player's scores
    function getPlayerScores(address _player) public view returns (Score[] memory) {
        return playerScores[_player];
    }

    // Get total number of players
    function getTotalPlayers() public view returns (uint256) {
        return totalPlayers;
    }

    // Get total number of scores submitted
    function getTotalScores() public view returns (uint256) {
        return allScores.length;
    }

    // Get player's most recent score
    function getLatestScore(address _player) public view returns (Score memory) {
        Score[] memory scores = playerScores[_player];
        require(scores.length > 0, "Player has no scores");
        return scores[scores.length - 1];
    }

    // Check if address has played
    function hasPlayed(address _player) public view returns (bool) {
        return playerScores[_player].length > 0;
    }
} 