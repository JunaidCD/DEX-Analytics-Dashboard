const { ethers } = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0x2df99b1EEa84B9f3f87e2c4356691E7Ec7da943D";
  const MTK_ADDRESS = "0x597515C09CbDbb8460E96370C4D13093BB517F61";
  const RECIPIENT = "0x6e149A3e52125e40535EbD22be90D8E699D46C5E";

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Minting with account:", deployer.address);

  // USDC - 1000 tokens (6 decimals)
  const usdc = await ethers.getContractAt("ERC20", USDC_ADDRESS);
  const usdcMintTx = await usdc.mint(RECIPIENT, ethers.parseUnits("1000", 6));
  await usdcMintTx.wait();
  console.log("Minted 1000 USDC to", RECIPIENT);

  // MTK - 1000 tokens (18 decimals)
  const mtk = await ethers.getContractAt("ERC20", MTK_ADDRESS);
  const mtkMintTx = await mtk.mint(RECIPIENT, ethers.parseEther("1000"));
  await mtkMintTx.wait();
  console.log("Minted 1000 MTK to", RECIPIENT);

  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
