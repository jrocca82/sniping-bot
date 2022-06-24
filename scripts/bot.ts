// Intianiate Web3 connection
import { ethers } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IUniswapV2Factory from '@uniswap/v2-core/build/IUniswapV2Factory.json'
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json"
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json"
import { createAccounts } from "./utils";

const uFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const uRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const AMOUNT = '0.25' // How much WETH are you willing to spend on new tokens?
const SLIPPAGE = 0.05 // 5% Slippage

const main = async () => {
    console.log(`Listening for new pairs...\n`);
    
    const accounts = await createAccounts();
    const uFactory = new ethers.Contract(uFactoryAddress, IUniswapV2Factory.abi, accounts.signer);
    const uRouter = new ethers.Contract(uRouterAddress, IUniswapV2Router02.interface, accounts.signer);
    const WETH = new ethers.Contract('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', IERC20.abi, accounts.signer);
    
    // Create event listener to listen to PairCreated
    const event = uFactory.filters.PairCreated();
    if (event) {
        console.log(`New pair detected...\n`);
        
        const tokenPair = uFactory.getPair();
        const token0 = tokenPair.token0;
        const token1 = tokenPair.token1;
        const pair = {token0, token1};
        console.log(`Token pair: ${pair}`);
        
        // Since we are buying this new token with WETH, we want to verify token0 & token1 address, and fetch the address of the new token
        let path: string[] = [];
        
        if (token0 === WETH._address) {
            path = [token0, token1]
        };

        if (token1 === WETH._address) {
            path = [token1, token0]
        };
        
        if (path.length === 0) {
            console.log(`Pair wasn\'t created with WETH...\n`)
            return
        };

        const uPair = new ethers.Contract(pair.toString(), IUniswapV2Pair.abi, accounts.signer);
        const token = new ethers.Contract(path[1], IERC20.abi, accounts.signer); // Path[1] will always be the token we are buying.

        console.log(`Checking liquidity...\n`);

        const reserves = await uPair.methods.getReserves().call();

        if (reserves[0] == 0 && reserves[1] == 0) {
            console.log(`Token has no liquidity...`)
            return
        };

        console.log(`Swapping WETH...\n`);

        try {
            const amountIn = ethers.utils.formatEther(ethers.utils.parseEther(AMOUNT));
            const amounts = await uRouter.methods.getAmountsOut(amountIn, path).call();
            const amountOut = String(amounts[1] - (amounts[1] * SLIPPAGE));
            const deadline = Date.now() + 1000 * 60 * 10;

            await WETH.methods.approve(uRouter._address, amountIn).send({ from: accounts.sniper });

            const gas = await uRouter.methods.swapExactTokensForTokens(amountIn, amountOut, path, accounts.sniper, deadline).estimateGas({ from: accounts.sniper })
            await uRouter.methods.swapExactTokensForTokens(amountIn, amountOut, path, accounts.sniper, deadline).send({ from: accounts.sniper, gas: gas })

            console.log(`Swap Successful\n`)

            // Check user balance of token:
            const symbol = await token.methods.symbol().call()
            const tokenBalance = await token.methods.balanceOf(accounts.sniper).call()

            console.log(`Successfully swapped ${AMOUNT} WETH for ${ethers.utils.parseEther(tokenBalance.toString())} ${symbol}\n`)
        } catch (error) {
            console.log(`Error Occured while swapping...`)
            console.log(`You may need to adjust slippage, or amountIn.\n`)
            console.log(error)
        }
    }

    
}

console.log(`Listening for new pairs...\n`)
main()