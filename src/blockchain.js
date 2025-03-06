// Replace with your deployed contract address
const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";

const abi = [
    "function updateScore(uint256 _score) external",
    "function getHighScore(address _player) external view returns (uint256)"
];

let provider, signer, contract;
let isConnected = false;

async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            
            // Check if the user is on the Monad Testnet
            const network = await provider.getNetwork();
            if (network.chainId !== 10143) {
                // Show network switch instructions
                alert("Please switch to the Monad Testnet:\n\nNetwork Name: Monad Testnet\nChain ID: 10143\nRPC URL: https://testnet-rpc.monad.xyz/\nBlock Explorer: https://testnet.monadexplorer.com/\nCurrency Symbol: MON");
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
            alert("Error connecting wallet. Please make sure MetaMask is installed and unlocked.");
        }
    } else {
        alert("Please install MetaMask to play this game!");
    }
}

async function updateHighScore(score) {
    if (!isConnected) {
        alert("Please connect your wallet first!");
        return Promise.reject("Wallet not connected");
    }
    
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
        if (scoresDiv) {
            scoresDiv.innerHTML = `<p>High Score: ${score}</p>`;
        }
    } catch (error) {
        console.error("Error fetching score history:", error);
    }
}

// Initialize wallet connection button
document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    }
    
    // Initially disable game until wallet is connected
    const gameElement = document.getElementById('game');
    if (gameElement) {
        gameElement.style.opacity = '0.5';
    }
}); 
initBlockchain(); 