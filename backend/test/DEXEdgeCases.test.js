const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX Edge Cases and Coverage", function () {
  let factory, router, pair, mockUSDC, mockToken, mockToken2, owner, user1;
  let pairAddress;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy(owner.address);
    await mockUSDC.waitForDeployment();

    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy(owner.address);
    await mockToken.waitForDeployment();

    mockToken2 = await MockToken.deploy(owner.address);
    await mockToken2.waitForDeployment();

    const DEXFactory = await ethers.getContractFactory("DEXFactory");
    factory = await DEXFactory.deploy(owner.address);
    await factory.waitForDeployment();

    const DEXRouter = await ethers.getContractFactory("DEXRouter");
    router = await DEXRouter.deploy(factory.target);
    await router.waitForDeployment();

    await factory.createPair(mockUSDC.target, mockToken.target);
    pairAddress = await factory.getPair(mockUSDC.target, mockToken.target);

    await factory.createPair(mockToken.target, mockToken2.target);

    pair = await ethers.getContractAt("DEXPair", pairAddress);

    await mockUSDC.mint(user1.address, ethers.parseUnits("10000", 6));
    await mockToken.mint(user1.address, ethers.parseUnits("10000", 18));
    await mockToken2.mint(user1.address, ethers.parseUnits("10000", 18));
  });

  describe("Mock Tokens", function () {
    it("should test MockUSDC decimals and faucet", async function () {
      expect(await mockUSDC.decimals()).to.equal(6);
      await mockUSDC.faucet(user1.address);
      expect(await mockUSDC.balanceOf(user1.address)).to.be.gt(0);
    });

    it("should test MockToken faucet", async function () {
      await mockToken.faucet(user1.address);
      expect(await mockToken.balanceOf(user1.address)).to.be.gt(0);
    });
  });

  describe("DEXRouter Edge Cases", function () {
    it("should revert on expired deadline", async function () {
      const deadline = Math.floor(Date.now() / 1000) - 3600; // Past
      await expect(
        router.addLiquidity(
          mockUSDC.target, mockToken.target, 100, 100, 0, 0, user1.address, deadline
        )
      ).to.be.revertedWith("DEXRouter: EXPIRED");

      await expect(
        router.removeLiquidity(
          mockUSDC.target, mockToken.target, 100, 0, 0, user1.address, deadline
        )
      ).to.be.revertedWith("DEXRouter: EXPIRED");

      await expect(
        router.swapExactTokensForTokens(
          100, 0, [mockUSDC.target, mockToken.target], user1.address, deadline
        )
      ).to.be.revertedWith("DEXRouter: EXPIRED");
    });

    it("should revert on invalid path", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await expect(
        router.swapExactTokensForTokens(100, 0, [mockUSDC.target], user1.address, deadline)
      ).to.be.revertedWith("DEXRouter: INVALID_PATH");

      await expect(
        router.getAmountsOut(100, [mockUSDC.target])
      ).to.be.revertedWith("DEXRouter: INVALID_PATH");
    });

    it("should revert if pair not exists", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const nonExistentToken = owner.address;
      await expect(
        router.addLiquidity(mockUSDC.target, nonExistentToken, 100, 100, 0, 0, user1.address, deadline)
      ).to.be.revertedWith("DEXRouter: PAIR_NOT_EXISTS");

      await expect(
        router.removeLiquidity(mockUSDC.target, nonExistentToken, 100, 0, 0, user1.address, deadline)
      ).to.be.revertedWith("DEXRouter: PAIR_NOT_EXISTS");
    });

    it("should handle optimal amount checks in addLiquidity", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await mockUSDC.connect(user1).approve(router.target, ethers.MaxUint256);
      await mockToken.connect(user1).approve(router.target, ethers.MaxUint256);

      // Add initial liquidity to set ratio at 1:1
      await router.connect(user1).addLiquidity(
        mockUSDC.target, mockToken.target, 
        1000000, 1000000, 0, 0, user1.address, deadline
      );

      // Attempt to add liquidity with skewed ratio
      // Desire 2000000 A and 1000000 B. optimal B for 2000000 A is 2000000
      // amountBDesired is 1000000, which is < optimal B, so it falls to 'else'
      // optimal A for 1000000 B is 1000000
      await router.connect(user1).addLiquidity(
        mockUSDC.target, mockToken.target,
        2000000, 1000000, 0, 0, user1.address, deadline
      );

      // Now revert cases for slippage
      await expect(
        router.connect(user1).addLiquidity(
          mockUSDC.target, mockToken.target,
          1000000, 2000000, 0, 2000000, user1.address, deadline // optimal B is 1000000, < 2000000 min
        )
      ).to.be.revertedWith("DEXRouter: INSUFFICIENT_B_AMOUNT");

      await expect(
        router.connect(user1).addLiquidity(
          mockUSDC.target, mockToken.target,
          2000000, 1000000, 2000000, 0, user1.address, deadline // optimal A is 1000000, < 2000000 min
        )
      ).to.be.revertedWith("DEXRouter: INSUFFICIENT_A_AMOUNT");
    });
    
    it("should complete multi-hop swap", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await mockUSDC.connect(user1).approve(router.target, ethers.MaxUint256);
      await mockToken.connect(user1).approve(router.target, ethers.MaxUint256);
      await mockToken2.connect(user1).approve(router.target, ethers.MaxUint256);

      await router.connect(user1).addLiquidity(mockUSDC.target, mockToken.target, 1000000, 1000000, 0, 0, user1.address, deadline);
      await router.connect(user1).addLiquidity(mockToken.target, mockToken2.target, 1000000, 1000000, 0, 0, user1.address, deadline);

      const path = [mockUSDC.target, mockToken.target, mockToken2.target];
      const amountsOut = await router.getAmountsOut(1000, path);

      await expect(
        router.connect(user1).swapExactTokensForTokens(1000, amountsOut[2], path, user1.address, deadline)
      ).to.emit(router, "Swap");
    });

    it("should prevent slippage in swap", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await mockUSDC.connect(user1).approve(router.target, ethers.MaxUint256);
      await mockToken.connect(user1).approve(router.target, ethers.MaxUint256);
      await router.connect(user1).addLiquidity(mockUSDC.target, mockToken.target, 1000000, 1000000, 0, 0, user1.address, deadline);

      const path = [mockUSDC.target, mockToken.target];
      await expect(
        router.connect(user1).swapExactTokensForTokens(1000, 2000, path, user1.address, deadline)
      ).to.be.revertedWith("DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT");
    });
  });

  describe("DEXPair Edge Cases", function () {
    it("should revert if non-factory initializes", async function () {
      await expect(pair.initialize(mockUSDC.target, mockToken.target)).to.be.revertedWith("DEX: FORBIDDEN");
    });

    it("should fail getAmountOut with zero inputs", async function () {
      await expect(pair.getAmountOut(0, 100, 100)).to.be.revertedWith("DEX: INSUFFICIENT_INPUT_AMOUNT");
      await expect(pair.getAmountOut(100, 0, 100)).to.be.revertedWith("DEX: INSUFFICIENT_LIQUIDITY");
    });
  });

  describe("DEXFactory Edge Cases", function () {
    it("should not create pair for identical addresses", async function () {
      await expect(factory.createPair(mockUSDC.target, mockUSDC.target)).to.be.revertedWith("DEX: IDENTICAL_ADDRESSES");
    });
    
    it("should not create pair with zero address", async function () {
      await expect(factory.createPair(mockUSDC.target, ethers.ZeroAddress)).to.be.revertedWith("DEX: ZERO_ADDRESS");
    });

    it("should not recreate same pair", async function () {
      await expect(factory.createPair(mockUSDC.target, mockToken.target)).to.be.revertedWith("DEX: PAIR_EXISTS");
    });
  });
});
