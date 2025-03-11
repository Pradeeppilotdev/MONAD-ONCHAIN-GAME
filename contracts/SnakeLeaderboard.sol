// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SnakeLeaderboard {
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    Score[] public scores;
    mapping(address => uint256) public playerBestScores;
    
    event ScoreSubmitted(address player, uint256 score, uint256 timestamp);
    
    function submitScore(uint256 _score) external {
        // Only update if it's the player's best score
        if (_score > playerBestScores[msg.sender]) {
            playerBestScores[msg.sender] = _score;
            
            // Add to scores array
            scores.push(Score(msg.sender, _score, block.timestamp));
            
            emit ScoreSubmitted(msg.sender, _score, block.timestamp);
        }
    }
    
    function getTopScores(uint256 count) external view returns (Score[] memory) {
        uint256 resultCount = count < scores.length ? count : scores.length;
        Score[] memory topScores = new Score[](resultCount);
        
        // Create a memory array for sorting
        Score[] memory tempScores = new Score[](scores.length);
        for(uint i = 0; i < scores.length; i++) {
            tempScores[i] = scores[i];
        }
        
        // Sort scores (simple bubble sort)
        for(uint i = 0; i < tempScores.length; i++) {
            for(uint j = i + 1; j < tempScores.length; j++) {
                if(tempScores[i].score < tempScores[j].score) {
                    Score memory temp = tempScores[i];
                    tempScores[i] = tempScores[j];
                    tempScores[j] = temp;
                }
            }
        }
        
        // Copy top scores
        for(uint i = 0; i < resultCount; i++) {
            topScores[i] = tempScores[i];
        }
        
        return topScores;
    }
    
    function getPlayerRank(address player) external view returns (uint256) {
        uint256 playerScore = playerBestScores[player];
        uint256 rank = 1;
        
        for(uint i = 0; i < scores.length; i++) {
            if(scores[i].score > playerScore) {
                rank++;
            }
        }
        
        return rank;
    }
} 