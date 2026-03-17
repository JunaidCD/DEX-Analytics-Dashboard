const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DEXToken with higher gas...");

  const initialSupply = ethers.parseEther("1000000");
  
  const dexTokenFactory = await ethers.getContractFactory("DEXToken");
  
  // Deploy with higher gas price
  const dexToken = await dexTokenFactory.deploy(initialSupply, {
    gasPrice: ethers.parseUnits("20", "gwei"), // Higher gas price
    gasLimit: 3000000
  });
  
  await dexToken.waitForDeployment();
  
  const address = await dexToken.getAddress();
  console.log(`DEXToken deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
