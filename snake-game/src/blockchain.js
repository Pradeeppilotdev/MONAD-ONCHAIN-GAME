// Replace with your deployed contract address
const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";

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
        console.log("Please install MetaMask!");
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

// Initialize blockchain connection
window.addEventListener("load", initBlockchain);