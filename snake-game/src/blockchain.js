// Replace with your deployed contract address
const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";

const abi = [
    "function updateScore(uint256 _score) external",
    "function eatMoyaki(uint256 _points) external",
    "function getHighScore(address _player) external view returns (uint256)",
    "event MoyakiEaten(address indexed player, uint256 points)"
];

let provider, signer, contract;
let isConnected = false;

async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);
            
            const address = await signer.getAddress();
            document.getElementById('walletInfo').textContent = 
                `Connected: ${address.substring(0, 6)}...${address.substring(38)}`;
            
            isConnected = true;
            displayScoreHistory();
            
            // Enable game elements
            document.getElementById('game').style.opacity = '1';
            document.getElementById('connectButton').textContent = 'Connected';
            
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function recordMoyakiEaten(points) {
    if (!isConnected) return;
    
    try {
        const tx = await contract.eatMoyaki(points);
        await tx.wait();
        console.log(`Moyaki eaten recorded: ${points} points`);
    } catch (error) {
        console.error("Error recording Moyaki eaten:", error);
    }
}

async function updateHighScore(score) {
    if (!isConnected) return;
    
    try {
        const tx = await contract.updateScore(score);
        await tx.wait();
        console.log(`High score updated: ${score}`);
        displayScoreHistory();
    } catch (error) {
        console.error("Error updating high score:", error);
    }
}

async function displayScoreHistory() {
    if (!isConnected) return;
    
    try {
        const address = await signer.getAddress();
        const score = await contract.getHighScore(address);
        
        const scoresDiv = document.getElementById('scores');
        scoresDiv.innerHTML = `<p>High Score: ${score}</p>`;
        
    } catch (error) {
        console.error("Error fetching score history:", error);
    }
}

// Initialize wallet connection button
document.getElementById('connectButton').addEventListener('click', connectWallet);

// Initially disable game until wallet is connected
document.getElementById('game').style.opacity = '0.5';