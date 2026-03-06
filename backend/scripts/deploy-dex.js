const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DEX Factory and creating pair...");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(deployer.address);
  await mockUSDC.waitForDeployment();
  console.log("MockUSDC deployed to:", mockUSDC.target);

  // Mint USDC to deployer
  await mockUSDC.mint(deployer.address, ethers.parseUnits("10000", 6));

  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy(deployer.address);
  await mockToken.waitForDeployment();
  console.log("MockToken deployed to:", mockToken.target);

  // Deploy DEXFactory
  const DEXFactory = await ethers.getContractFactory("DEXFactory");
  const factory = await DEXFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  console.log("DEXFactory deployed to:", factory.target);

  // Create pair
  const tx = await factory.createPair(mockUSDC.target, mockToken.target);
  await tx.wait();
  console.log("Pair created!");

  // Get pair address
  const pairAddress = await factory.getPair(mockUSDC.target, mockToken.target);
  console.log("Pair address:", pairAddress);

  // Add initial liquidity
  const DEXPair = await ethers.getContractFactory("DEXPair");
  const pair = DEXPair.attach(pairAddress);

  const usdcAmount = ethers.parseUnits("1000", 6);
  const tokenAmount = ethers.parseUnits("1000", 18);

  await mockUSDC.transfer(pairAddress, usdcAmount);
  await mockToken.transfer(pairAddress, tokenAmount);
  await pair.mint(deployer.address);
  console.log("Initial liquidity added!");

  console.log("\n=== Deployment Summary ===");
  console.log("MockUSDC:", mockUSDC.target);
  console.log("MockToken:", mockToken.target);
  console.log("DEXFactory:", factory.target);
  console.log("Pair (USDC/MTK):", pairAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
