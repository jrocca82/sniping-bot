import { ethers } from "ethers";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { task } from "hardhat/config";
import { createAccounts } from "../utils";

const UNLOCKED_ACCOUNT = "0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3";

task("create-pool").setAction(async () => {
  const accounts = await createAccounts();
  
  const WETH = new ethers.Contract(
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    IERC20.abi,
    accounts.signer
  );

  const amount = ethers.utils.parseEther("10");

  await WETH.methods
    .transfer(accounts.deployer, amount)
    .send({ from: UNLOCKED_ACCOUNT });
  await WETH.methods.transfer(accounts.sniper, amount).send({ from: UNLOCKED_ACCOUNT });

  const deployerBalance = await WETH.methods.balanceOf(accounts.deployer).call();
  console.log(`WETH amount in deployer: ${deployerBalance / 1e18}\n`);

  const sniperBalance = await WETH.methods.balanceOf(accounts.sniper).call();
  console.log(`WETH amount in sniper: ${sniperBalance / 1e18}\n`);

});

const fund = async (
  hre: { run: (arg0: string, arg1: { address: string }) => any }
) => {
  try {
    await hre.run("fund:fund", {
      //TO-DO: Figure out what this actually needs to be-- watch video
      address: UNLOCKED_ACCOUNT
    });
  } catch (e) {
    console.error(e);
  }
};

export default fund;
