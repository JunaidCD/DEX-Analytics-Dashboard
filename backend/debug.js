const { ethers } = require("ethers");

function check(reserve0, reserve1, balance0, balance1, amount0Out, amount1Out) {
    const amount0In = balance0 > (reserve0 - amount0Out) ? balance0 - (reserve0 - amount0Out) : 0n;
    const amount1In = balance1 > (reserve1 - amount1Out) ? balance1 - (reserve1 - amount1Out) : 0n;

    const balance0Adjusted = balance0 * 1000n - amount0In * 3n;
    const balance1Adjusted = balance1 * 1000n - amount1In * 3n;

    const left = balance0Adjusted * balance1Adjusted;
    const right = reserve0 * reserve1 * 1000000n;
    
    console.log("balance0 =", balance0);
    console.log("balance1 =", balance1);
    console.log("amount0In =", amount0In);
    console.log("amount1In =", amount1In);
    console.log("balance0Adjusted =", balance0Adjusted);
    console.log("balance1Adjusted =", balance1Adjusted);
    console.log("left =", left);
    console.log("right =", right);
    console.log("valid =", left >= right);
}

// simulate the test manually
const reserve0 = 1000000n;
const reserve1 = 1000000n;
const balance0 = 1001000n;
const balance1 = 999004n;
const amount0Out = 0n;
const amount1Out = 996n;

check(reserve0, reserve1, balance0, balance1, amount0Out, amount1Out);
