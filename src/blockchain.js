// Replace with your deployed contract address
const contractAddress = "0x51fC5B331290c52FfdbFD0CA3896D04063dB4e40";

const abi = [
    "function updateScore(uint256 _score) external",
    "function getHighScore(address _player) external view returns (uint256)"
];

// Monad Testnet network parameters
const monadTestnet = {
    chainId: '0x279F', // 10143 in hex
    chainName: 'Monad Testnet',
    nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz/'],
    blockExplorerUrls: ['https://testnet.monadexplorer.com/']
};

let provider, signer, contract;
let isConnected = false;

async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            
            // Check if the user is on the Monad Testnet
            const network = await provider.getNetwork();
            if (network.chainId !== 10143) {
                // Ask user to switch to Monad Testnet
                try {
                    await switchToMonadTestnet();
                    // Refresh provider after network switch
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                } catch (switchError) {
                    console.error("Error switching network:", switchError);
                    return;
                }
            }
            
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
            
            // Notify the game that wallet is connected
            if (typeof window.setWalletConnected === 'function') {
                window.setWalletConnected();
            }
            
            // Also dispatch an event for more flexibility
            window.dispatchEvent(new Event('walletConnected'));
            
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Error connecting wallet. Please make sure MetaMask is installed and unlocked.");
        }
    } else {
        alert("Please install MetaMask to play this game!");
    }
}

async function switchToMonadTestnet() {
    try {
        // Try to switch to Monad Testnet
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: monadTestnet.chainId }],
        });
        return true;
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                // Add Monad Testnet to MetaMask
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [monadTestnet],
                });
                
                // Try switching again
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: monadTestnet.chainId }],
                });
                
                alert("Monad Testnet has been added to your wallet and selected.");
                return true;
            } catch (addError) {
                console.error("Error adding Monad Testnet:", addError);
                alert("Failed to add Monad Testnet to your wallet. Please add it manually.");
                
                // Show manual instructions
                showNetworkInstructions();
                return false;
            }
        } else {
            console.error("Error switching to Monad Testnet:", switchError);
            alert("Failed to switch to Monad Testnet. Please switch manually.");
            
            // Show manual instructions
            showNetworkInstructions();
            return false;
        }
    }
}

function showNetworkInstructions() {
    const instructions = `
        Please add Monad Testnet to your wallet with these details:
        
        Network Name: Monad Testnet
        Chain ID: 10143
        RPC URL: https://testnet-rpc.monad.xyz/
        Currency Symbol: MON
        Block Explorer URL: https://testnet.monadexplorer.com/
    `;
    
    alert(instructions);
}

async function updateHighScore(score) {
    if (!isConnected) {
        alert("Please connect your wallet first!");
        return Promise.reject("Wallet not connected");
    }
    
    try {
        // Check network again before transaction
        const network = await provider.getNetwork();
        if (network.chainId !== 10143) {
            alert("Please switch to Monad Testnet to submit your score.");
            await switchToMonadTestnet();
            return Promise.reject("Wrong network");
        }
        
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

// Listen for network changes
if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
        // Reload the page when the network changes
        window.location.reload();
    });
} 