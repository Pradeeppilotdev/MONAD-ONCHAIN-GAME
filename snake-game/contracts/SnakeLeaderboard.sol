// Add to your smart contract

struct Score {
    address player;
    uint256 score;
    uint256 timestamp;
}

Score[] public allScores;
mapping(address => uint256) public highScores;

function submitScore(uint256 _score) public {
    allScores.push(Score(msg.sender, _score, block.timestamp));
    if (_score > highScores[msg.sender]) {
        highScores[msg.sender] = _score;
    }
}

function getTopScores() public view returns (Score[] memory) {
    // Return top 100 scores
    // Implementation details depend on your sorting strategy
}

function getUserRank(address _player) public view returns (uint256) {
    // Calculate user's rank based on their high score
    // Implementation details depend on your ranking strategy
}

function getHighScore(address _player) public view returns (uint256) {
    return highScores[_player];
}