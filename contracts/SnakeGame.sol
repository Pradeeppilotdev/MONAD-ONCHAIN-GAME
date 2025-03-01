// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SnakeGame {
    mapping(address => uint256) public highScores;
    event MoyakiEaten(address indexed player, uint256 points);

    function updateScore(uint256 _score) external {
        if (_score > highScores[msg.sender]) {
            highScores[msg.sender] = _score;
        }
    }

    function eatMoyaki(uint256 _points) external {
        emit MoyakiEaten(msg.sender, _points);
    }

    function getHighScore(address _player) external view returns (uint256) {
        return highScores[_player];
    }
} 