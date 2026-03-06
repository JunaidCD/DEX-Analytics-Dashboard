const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MockUSDC...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(deployer.address);
  
  await mockUSDC.waitForDeployment();
  
  const address = await mockUSDC.getAddress();
  console.log(`MockUSDC deployed to: ${address}`);
  
  // Mint some initial tokens to the deployer
  const mintAmount = ethers.parseUnits("1000000", 6); // 1,000,000 MUSDC with 6 decimals
  await mockUSDC.mint(deployer.address, mintAmount);
  console.log(`Minted ${ethers.formatUnits(mintAmount, 6)} MUSDC to ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
