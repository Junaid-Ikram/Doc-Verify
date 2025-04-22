const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying DocumentVerification contract...");

  const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
  const documentVerification = await DocumentVerification.deploy();

  // Wait for the contract to be deployed and log the address
  await documentVerification.waitForDeployment();
  const contractAddress = await documentVerification.getAddress();

  // Debugging log to check if address is being properly fetched
  console.log("DocumentVerification deployed to:", contractAddress);

  if (!contractAddress) {
    console.error("Error: Contract deployment failed!");
    process.exit(1);  // Exit if deployment failed
  }

  // Ensure the directory exists
  const dir = path.join(__dirname, "../src/config");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Store contract address for frontend
  const contractAddresses = {
    DocumentVerification: contractAddress,
  };

  fs.writeFileSync(
    path.join(dir, "contractAddresses.json"),
    JSON.stringify(contractAddresses, null, 2)
  );
  
  console.log("Contract address written to src/config/contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
