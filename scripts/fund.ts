import { ethers } from "ethers";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

//TO-DO: Add signer/provider
const WETH = new ethers.Contract(
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  IERC20.abi
);

const UNLOCKED_ACCOUNT = "0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3";

const fund = async (callback: () => void) => {
  let addresses: string[];
  //TO-DO create set deployer and sniper and set addresses
  let deployer;
  let sniper;
  deployer = ethers.utils.getAddress(deployer);
  sniper = ethers.utils.getAddress(sniper);
  addresses = [deployer, sniper];

  const amount = ethers.utils.parseEther("10");

  await WETH.methods
    .transfer(deployer, amount)
    .send({ from: UNLOCKED_ACCOUNT });
  await WETH.methods.transfer(sniper, amount).send({ from: UNLOCKED_ACCOUNT });

  const deployerBalance = await WETH.methods.balanceOf(deployer).call();
  console.log(`WETH amount in deployer: ${deployerBalance / 1e18}\n`);

  const sniperBalance = await WETH.methods.balanceOf(sniper).call();
  console.log(`WETH amount in sniper: ${sniperBalance / 1e18}\n`);

  callback();
};

export default fund;
