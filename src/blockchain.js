// Replace with your deployed contract address
const contractAddress = "0x8969aA19462Ed451ebD7DdB8e69e18a6BFfF08c7";

const abi = [
    "function updateScore(uint256 _score) external",
    "function eatMoyaki(uint256 _points) external",
    "function getHighScore(address _player) external view returns (uint256)",
    "event MoyakiEaten(address indexed player, uint256 points)"
];

let provider, signer, contract;

async function initBlockchain() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Connected to Monad testnet");
    } else {
        alert("Please install MetaMask and connect to Monad testnet!");
    }
}

async function recordMoyakiEaten(points) {
    try {
        const tx = await contract.eatMoyaki(points);
        await tx.wait();
        console.log(`Moyaki eaten recorded: ${points} points`);
    } catch (error) {
        console.error("Error recording Moyaki eaten:", error);
    }
}

async function updateHighScore(score) {
    try {
        const tx = await contract.updateScore(score);
        await tx.wait();
        console.log(`High score updated: ${score}`);
    } catch (error) {
        console.error("Error updating high score:", error);
    }
}

async function getHighScore() {
    try {
        const address = await signer.getAddress();
        const score = await contract.getHighScore(address);
        console.log(`Your high score: ${score}`);
        return score;
    } catch (error) {
        console.error("Error fetching high score:", error);
    }
}

// Initialize blockchain connection on load
initBlockchain(); 