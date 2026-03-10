const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEXRouter - Full Flow", function () {
  let factory, router, mockUSDC, mockToken, owner, user1;
  let pairAddress;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy(owner.address);
    await mockUSDC.waitForDeployment();

    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy(owner.address);
    await mockToken.waitForDeployment();

    // Deploy DEXFactory
    const DEXFactory = await ethers.getContractFactory("DEXFactory");
    factory = await DEXFactory.deploy(owner.address);
    await factory.waitForDeployment();

    // Deploy DEXRouter
    const DEXRouter = await ethers.getContractFactory("DEXRouter");
    router = await DEXRouter.deploy(factory.target);
    await router.waitForDeployment();

    // Create pair
    await factory.createPair(mockUSDC.target, mockToken.target);
    pairAddress = await factory.getPair(mockUSDC.target, mockToken.target);

    // Mint USDC and Token to user1
    await mockUSDC.mint(user1.address, ethers.parseUnits("10000", 6));
    await mockToken.mint(user1.address, ethers.parseUnits("10000", 18));
  });

  describe("Add Liquidity", function () {
    it("should add liquidity via router", async function () {
      const usdcAmount = ethers.parseUnits("100", 6);
      const tokenAmount = ethers.parseUnits("100", 18);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      // Approve tokens for router
      await mockUSDC.connect(user1).approve(router.target, usdcAmount);
      await mockToken.connect(user1).approve(router.target, tokenAmount);

      // Add liquidity
      const tx = await router.connect(user1).addLiquidity(
        mockUSDC.target,
        mockToken.target,
        usdcAmount,
        tokenAmount,
        1,
        1,
        user1.address,
        deadline
      );
      const receipt = await tx.wait();

      // Check LP tokens received
      const pair = await ethers.getContractAt("IERC20", pairAddress);
      const lpBalance = await pair.balanceOf(user1.address);
      expect(lpBalance > 0n).to.be.true;
    });
  });

  describe("Remove Liquidity", function () {
    let lpBalance;

    beforeEach(async function () {
      // Add liquidity first
      const usdcAmount = ethers.parseUnits("100", 6);
      const tokenAmount = ethers.parseUnits("100", 18);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await mockUSDC.connect(user1).approve(router.target, usdcAmount);
      await mockToken.connect(user1).approve(router.target, tokenAmount);

      await router.connect(user1).addLiquidity(
        mockUSDC.target,
        mockToken.target,
        usdcAmount,
        tokenAmount,
        1,
        1,
        user1.address,
        deadline
      );

      // Get LP balance
      const pair = await ethers.getContractAt("IERC20", pairAddress);
      lpBalance = await pair.balanceOf(user1.address);
    });

    it("should remove liquidity via router", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // Approve LP tokens
      const pair = await ethers.getContractAt("IERC20", pairAddress);
      await pair.connect(user1).approve(router.target, lpBalance);

      const userUSDCBefore = await mockUSDC.balanceOf(user1.address);
      const userTokenBefore = await mockToken.balanceOf(user1.address);

      // Remove half liquidity
      await router.connect(user1).removeLiquidity(
        mockUSDC.target,
        mockToken.target,
        lpBalance / 2n,
        1,
        1,
        user1.address,
        deadline
      );

      const userUSDCAfter = await mockUSDC.balanceOf(user1.address);
      const userTokenAfter = await mockToken.balanceOf(user1.address);

      expect(userUSDCAfter - userUSDCBefore > 0n).to.be.true;
      expect(userTokenAfter - userTokenBefore > 0n).to.be.true;
    });
  });

  describe("End-to-End Flow", function () {
    // Test that liquidity can be added and removed successfully
    it("should add liquidity and check reserves", async function () {
      // Step 1: Add liquidity
      const usdcAmount = ethers.parseUnits("500", 6);
      const tokenAmount = ethers.parseUnits("500", 18);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await mockUSDC.connect(user1).approve(router.target, usdcAmount);
      await mockToken.connect(user1).approve(router.target, tokenAmount);

      const tx = await router.connect(user1).addLiquidity(
        mockUSDC.target,
        mockToken.target,
        usdcAmount,
        tokenAmount,
        1,
        1,
        user1.address,
        deadline
      );
      await tx.wait();

      // Check LP tokens
      const pair = await ethers.getContractAt("IERC20", pairAddress);
      const lpBalance = await pair.balanceOf(user1.address);
      expect(lpBalance > 0n).to.be.true;

      // Check reserves
      const dexPair = await ethers.getContractAt("DEXPair", pairAddress);
      const [reserve0, reserve1] = await dexPair.getReserves();
      expect(reserve0 > 0n).to.be.true;
      expect(reserve1 > 0n).to.be.true;

      console.log("=== End-to-End Test Results ===");
      console.log("LP Tokens Received:", lpBalance.toString());
      console.log("Reserves - Token0 (USDC):", reserve0.toString());
      console.log("Reserves - Token1 (MTK):", reserve1.toString());
    });
  });
});
