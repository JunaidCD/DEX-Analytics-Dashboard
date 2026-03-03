import { ethers } from "hardhat";

async function main() {
  console.log("Deploying DEXToken...");

  const initialSupply = ethers.parseEther("1000000");
  
  const dexTokenFactory = await ethers.getContractFactory("DEXToken");
  const dexToken = await dexTokenFactory.deploy(initialSupply);
  
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
