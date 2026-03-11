const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DEX Contracts with Router...");

  // Get deployer
  const [deployer, user1] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(deployer.address);
  await mockUSDC.waitForDeployment();
  console.log("MockUSDC deployed to:", mockUSDC.target);

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

  // Deploy DEXRouter
  const DEXRouter = await ethers.getContractFactory("DEXRouter");
  const router = await DEXRouter.deploy(factory.target);
  await router.waitForDeployment();
  console.log("DEXRouter deployed to:", router.target);

  // Create pair
  const tx = await factory.createPair(mockUSDC.target, mockToken.target);
  await tx.wait();
  console.log("Pair created!");

  const pairAddress = await factory.getPair(mockUSDC.target, mockToken.target);
  console.log("Pair address:", pairAddress);

  // Mint tokens to deployer
  await mockUSDC.mint(deployer.address, ethers.parseUnits("10000", 6));
  await mockToken.mint(deployer.address, ethers.parseUnits("10000", 18));
  console.log("Minted 10000 USDC and 10000 MTK to deployer");

  // Add liquidity
  const usdcAmount = ethers.parseUnits("1000", 6);
  const tokenAmount = ethers.parseUnits("1000", 18);
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  await mockUSDC.approve(router.target, usdcAmount);
  await mockToken.approve(router.target, tokenAmount);

  const addLiqTx = await router.addLiquidity(
    mockUSDC.target,
    mockToken.target,
    usdcAmount,
    tokenAmount,
    1,
    1,
    deployer.address,
    deadline
  );
  await addLiqTx.wait();
  console.log("Liquidity added!");

  // Check reserves
  const pair = await ethers.getContractAt("DEXPair", pairAddress);
  const [reserve0, reserve1] = await pair.getReserves();
  console.log("Reserves - Token0:", reserve0.toString());
  console.log("Reserves - Token1:", reserve1.toString());

  console.log("\n=== Deployment Summary ===");
  console.log("MockUSDC:", mockUSDC.target);
  console.log("MockToken:", mockToken.target);
  console.log("DEXFactory:", factory.target);
  console.log("DEXRouter:", router.target);
  console.log("Pair (USDC/MTK):", pairAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
