// Replace with your deployed contract address
const contractAddress = "0x51fC5B331290c52FfdbFD0CA3896D04063dB4e40";

const abi = [
    "function updateScore(uint256 _score) external",
    "function eatMoyaki(uint256 _points) external",
    "function getHighScore(address _player) external view returns (uint256)",
    "event MoyakiEaten(address indexed player, uint256 points)"//made it with care haha
];

let provider, signer, contract;
let isConnected = false;

async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            const network = await provider.getNetwork();

            // Check if the user is on the Monad Testnet
            if (network.chainId !== 10143) {
                alert("Please switch to the Monad Testnet.");
                return;
            }

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



async function updateHighScore(score) {
    if (!isConnected){
        alert("Please connect your wallet first!");
        return Promise.reject("Wallet not connected");
    };
    
    try {
        // Show a message to the user
        alert(`Submitting your score of ${score} to the blockchain. Please confirm the transaction in MetaMask.`);
        
        const tx = await contract.updateScore(score);
        await tx.wait();
        console.log(`High score updated: ${score}`);
        alert("Score successfully recorded on the blockchain!");
        return Promise.resolve();
    } catch (error) {
        console.error("Error updating high score:", error);
        alert("Failed to record score. Please try again.");
        return Promise.reject(error);
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