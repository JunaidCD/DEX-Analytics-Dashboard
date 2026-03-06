const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX Factory and Pair", function () {
  let factory, pair, mockUSDC, mockToken, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy(owner.address);
    await mockUSDC.waitForDeployment();

    // Deploy MockToken (18 decimals like ETH)
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy(owner.address);
    await mockToken.waitForDeployment();

    // Deploy DEXFactory
    const DEXFactory = await ethers.getContractFactory("DEXFactory");
    factory = await DEXFactory.deploy(owner.address);
    await factory.waitForDeployment();

    // Create pair
    await factory.createPair(mockUSDC.target, mockToken.target);
    const pairAddress = await factory.getPair(mockUSDC.target, mockToken.target);

    // Get pair contract
    const DEXPair = await ethers.getContractFactory("DEXPair");
    pair = DEXPair.attach(pairAddress);

    // Mint tokens to user1 - use same amounts for simplicity
    await mockUSDC.mint(user1.address, ethers.parseUnits("10000", 6));
    await mockToken.mint(user1.address, ethers.parseUnits("10000", 18));
  });

  describe("Factory", function () {
    it("should create a pair", async function () {
      const pairAddress = await factory.getPair(mockUSDC.target, mockToken.target);
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should return correct pair address", async function () {
      const pairAddress = await factory.getPair(mockUSDC.target, mockToken.target);
      expect(pairAddress).to.equal(await factory.getPair(mockToken.target, mockUSDC.target));
    });

    it("should track all pairs", async function () {
      const length = await factory.allPairsLength();
      expect(length).to.equal(1);
    });
  });

  describe("Pair - Liquidity", function () {
    it("should add liquidity", async function () {
      // Use same value scaled to 18 decimals for consistency
      const usdcAmount = ethers.parseUnits("100", 6);  // 100 USDC
      const tokenAmount = ethers.parseUnits("100", 18); // 100 tokens

      // Transfer tokens to pair first
      await mockUSDC.connect(user1).transfer(pair.target, usdcAmount);
      await mockToken.connect(user1).transfer(pair.target, tokenAmount);

      await pair.connect(user1).mint(user1.address);

      const lpBalance = await pair.balanceOf(user1.address);
      expect(lpBalance).to.be.gt(0);
    });

    it("should get correct reserves after adding liquidity", async function () {
      const usdcAmount = ethers.parseUnits("100", 6);
      const tokenAmount = ethers.parseUnits("100", 18);

      // Transfer tokens to pair first
      await mockUSDC.connect(user1).transfer(pair.target, usdcAmount);
      await mockToken.connect(user1).transfer(pair.target, tokenAmount);

      await pair.connect(user1).mint(user1.address);

      const [reserve0, reserve1] = await pair.getReserves();
      // reserves are stored as uint112
      expect(reserve0).to.be.gt(0);
      expect(reserve1).to.be.gt(0);
    });
  });

  describe("Pair - Swap", function () {
    beforeEach(async function () {
      // Add liquidity first - use larger amounts
      const usdcAmount = ethers.parseUnits("1000", 6);
      const tokenAmount = ethers.parseUnits("1000", 18);

      // Transfer tokens to pair first
      await mockUSDC.connect(user1).transfer(pair.target, usdcAmount);
      await mockToken.connect(user1).transfer(pair.target, tokenAmount);
      await pair.connect(user1).mint(user1.address);
    });

    it("should get amount out correctly", async function () {
      const amountIn = ethers.parseUnits("1", 18); // 1 token
      const [reserve0, reserve1] = await pair.getReserves();

      // Get expected output using the contract
      const amountOut = await pair.getAmountOut(amountIn, reserve1, reserve0);
      expect(amountOut).to.be.gt(0);
    });
  });
});
