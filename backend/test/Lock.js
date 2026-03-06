const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEXToken", function () {
  let dexToken;

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    const dexTokenFactory = await ethers.getContractFactory("DEXToken");
    dexToken = await dexTokenFactory.deploy(ethers.parseEther("1000000"));
    await dexToken.waitForDeployment();
  });

  it("should have correct name and symbol", async function () {
    expect(await dexToken.name()).to.equal("DEX Token");
    expect(await dexToken.symbol()).to.equal("DEX");
  });

  it("should mint initial supply to deployer", async function () {
    const [owner] = await ethers.getSigners();
    expect(await dexToken.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
  });

  it("should transfer correctly", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await dexToken.transfer(addr1.address, ethers.parseEther("100"));
    expect(await dexToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
  });
});
