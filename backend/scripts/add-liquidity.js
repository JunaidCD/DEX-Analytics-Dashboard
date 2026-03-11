const { ethers } = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0xc118ce9D103862a3eb89386EC925e584A3FA63bA";
  const MTK_ADDRESS = "0x55CFF287c2317F1bb66011ac00D4A25aEb567962";
  const ROUTER_ADDRESS = "0x15Ea12D7c9d2BB84770403FCd371657aE7F1A8a2";
  const RECIPIENT = "0x6e149A3e52125e40535EbD22be90D8E699D46C5E";

  const [deployer] = await ethers.getSigners();
  console.log("Adding liquidity with account:", deployer.address);

  // Get contracts
  const usdc = await ethers.getContractAt("ERC20", USDC_ADDRESS);
  const mtk = await ethers.getContractAt("ERC20", MTK_ADDRESS);
  const router = await ethers.getContractAt([
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)"
  ], ROUTER_ADDRESS);

  // Approve tokens for router
  const usdcApproveTx = await usdc.approve(ROUTER_ADDRESS, ethers.parseUnits("1000", 6));
  await usdcApproveTx.wait();
  console.log("Approved USDC");

  const mtkApproveTx = await mtk.approve(ROUTER_ADDRESS, ethers.parseEther("1000"));
  await mtkApproveTx.wait();
  console.log("Approved MTK");

  // Add liquidity: 100 USDC + 100 MTK
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const addLiquidityTx = await router.addLiquidity(
    USDC_ADDRESS,
    MTK_ADDRESS,
    ethers.parseUnits("100", 6),  // amountADesired
    ethers.parseEther("100"),       // amountBDesired
    0, 0,                          // amountAMin, amountBMin
    RECIPIENT,
    deadline
  );
  await addLiquidityTx.wait();
  console.log("Added liquidity!");

  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
