📄 Document Verification DApp
A fully decentralized application (DApp) built using Next.js, Solidity, and Hardhat, designed to verify the authenticity of documents by hashing and storing data on the Ethereum Sepolia Testnet.

🌟 Overview
The Document Verification DApp enables users to:

✅ Upload documents and store their cryptographic hash on the blockchain

🔍 Verify the authenticity of uploaded documents by comparing hashes

🛡 Ensure tamper-proof validation using Ethereum's decentralized nature

This DApp eliminates the need for centralized document verification, making the process transparent, secure, and trustless.

🚀 Live Smart Contract
Contract Name: DocumentVerification

Deployed On: Sepolia Testnet

Smart Contract Address:
0x1BBa7749edcF26c667147c0DBf9eE23902c323Ad

🧠 Tech Stack

Layer	Technologies Used
Frontend	Next.js, React, Ethers.js
Smart Contract	Solidity, Hardhat
Storage	(Optional) IPFS via Pinata
Network	Ethereum Sepolia Testnet
Other	dotenv, Etherscan API, Infura or Alchemy
📁 Project Structure
bash
Copy
Edit
📦 document-verification-dapp
├── 📄 hardhat.config.js         # Hardhat settings
├── 📄 package.json
├── 📁 contracts
│   └── DocumentVerification.sol  # Smart contract
├── 📁 scripts
│   └── deploy.js                 # Deployment script
├── 📁 src
│   ├── 📁 config
│   │   └── contractAddresses.json # Stores deployed contract address
│   ├── 📁 pages
│   │   └── index.js              # Main DApp frontend page
├── 📄 .env                       # Environment secrets
⚙️ Getting Started Locally
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/your-username/document-verification-dapp.git
cd document-verification-dapp
2. Install Dependencies
bash
Copy
Edit
npm install
3. Set Up Environment Variables
Create a .env file in the root directory with the following:

env
Copy
Edit
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
Note: Keep .env private and do NOT share it.

4. Compile the Smart Contract
bash
Copy
Edit
npx hardhat compile
5. Deploy to Sepolia Testnet
bash
Copy
Edit
npx hardhat run scripts/deploy.js --network sepolia
After deployment, the address will be saved automatically to:

bash
Copy
Edit
src/config/contractAddresses.json
6. Start the Frontend
bash
Copy
Edit
npm run dev
Visit http://localhost:3000 in your browser.

🔎 Verifying Smart Contract on Etherscan
To verify your contract on Sepolia Etherscan:

bash
Copy
Edit
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
Example:

bash
Copy
Edit
npx hardhat verify --network sepolia 0x1BBa7749edcF26c667147c0DBf9eE23902c323Ad
Ensure the ETHERSCAN_API_KEY is present in your .env file.

📸 Screenshots
(You can add screenshots here by placing them in a folder like /assets and embedding like below)

md
Copy
Edit
![Home Page](./assets/homepage.png)
![Verification Success](./assets/verified.png)
📜 License
This project is licensed under the MIT License.# Doc-Verify
