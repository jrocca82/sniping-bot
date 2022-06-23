import { ethers } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { Token } from "../build/typechain";
import { task } from "hardhat/config";
import { deploy } from "./deploy/contracts/Token";

//TO-DO Create actual signer/provider/deployer
let provider;
let signer;
const deployer = ethers.utils.getAddress(provider);
const uRouter = new ethers.Contract(
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  IUniswapV2Router02.abi,
  signer
);

task("create-pool").setAction(async () => {
  console.log(`Preparing to create Uniswap pool...\n`);
  const token: Token = (await deploy(provider, deployer)) as Token;
  console.log(`Token deployed to: ${token.address}`);
  const DAPPU = await token.deployed();
  const WETH = new ethers.Contract(
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    IERC20.abi,
    signer
  );
  const DAPPUAmount = ethers.utils.parseEther("250");
  const WETHAmount = ethers.utils.parseEther("1");
  console.log(`Approving WETH...`);
  await WETH.methods
    .approve(uRouter._address, WETHAmount)
    .send({ from: deployer });

  console.log(`Approving DAPPU...\n`);

  await DAPPU.approve(uRouter._address, DAPPUAmount, { from: deployer });

  console.log(`Creating Uniswap pool...\n`);

  const gas = await uRouter.methods
    .addLiquidity(
      DAPPU.address,
      WETH._address,
      DAPPUAmount,
      WETHAmount,
      DAPPUAmount,
      WETHAmount,
      deployer,
      Math.floor(Date.now() / 1000) + 60 * 10
    )
    .estimateGas({ from: deployer });

  await uRouter.methods
    .addLiquidity(
      DAPPU.address,
      WETH._address,
      DAPPUAmount,
      WETHAmount,
      DAPPUAmount,
      WETHAmount,
      deployer,
      Math.floor(Date.now() / 1000) + 60 * 10
    )
    .send({ from: deployer, gas: gas });

  console.log(`Pool successfully created!\n`);
});

const createPool = async (
  tokenContractAddress: string,
  hre: { run: (arg0: string, arg1: { address: string }) => any }
) => {
  try {
    await hre.run("create-pool:create-pool", {
      address: tokenContractAddress
    });
  } catch (e) {
    console.error(e);
  }
};

export default createPool;
