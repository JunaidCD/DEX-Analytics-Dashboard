const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy(deployer.address);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // Deploy MockToken  
  const MockToken = await ethers.getContractFactory("MockToken");
  const mtk = await MockToken.deploy(deployer.address);
  await mtk.waitForDeployment();
  const mtkAddress = await mtk.getAddress();
  console.log("MockToken deployed to:", mtkAddress);

  // Mint 1000 USDC to the user
  const RECIPIENT = "0x6e149A3e52125e40535EbD22be90D8E699D46C5E";
  const usdcMintTx = await usdc.mint(RECIPIENT, ethers.parseUnits("1000", 6));
  await usdcMintTx.wait();
  console.log("Minted 1000 USDC to", RECIPIENT);

  // Mint 1000 MTK to the user
  const mtkMintTx = await mtk.mint(RECIPIENT, ethers.parseEther("1000"));
  await mtkMintTx.wait();
  console.log("Minted 1000 MTK to", RECIPIENT);

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("USDC:", usdcAddress);
  console.log("MTK:", mtkAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
