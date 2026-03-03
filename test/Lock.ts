import { expect } from "chai";
import { ethers } from "hardhat";
import { DEXToken } from "../typechain-types";

describe("DEXToken", () => {
  let dexToken: DEXToken;

  beforeEach(async () => {
    const [owner] = await ethers.getSigners();
    const dexTokenFactory = await ethers.getContractFactory("DEXToken");
    dexToken = (await dexTokenFactory.deploy(ethers.parseEther("1000000"))) as DEXToken;
    await dexToken.waitForDeployment();
  });

  it("should have correct name and symbol", async () => {
    expect(await dexToken.name()).to.equal("DEX Token");
    expect(await dexToken.symbol()).to.equal("DEX");
  });

  it("should mint initial supply to deployer", async () => {
    const [owner] = await ethers.getSigners();
    expect(await dexToken.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
  });

  it("should transfer correctly", async () => {
    const [owner, addr1] = await ethers.getSigners();
    await dexToken.transfer(addr1.address, ethers.parseEther("100"));
    expect(await dexToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
  });
});
