import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the ZkMochi contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);
  console.log("Wallet address: " + wallet.address)

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("ZkMochi");

  // Estimate contract deployment fee
  const baseURL = "ipfs://QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u/";
  const deploymentFee = await deployer.estimateDeployFee(artifact, [baseURL]);

  // ask yes/no if you want to continue
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    `The deployment is estimated to cost ${ethers.utils.formatEther(
      deploymentFee.toString()
    )} ETH. Do you want to continue? (y/n)`,
    (answer: string) => {
      if (answer.toLowerCase() == "y") {
        console.log("Deploying...");
        rl.close();
      } else {
        console.log("Exiting...");
        process.exit(0);
      }
    }
  );
  // wait for user input
  await new Promise((resolve) => rl.on("close", resolve));


  // ⚠️ OPTIONAL: You can skip this block if your account already has funds in L2
  // Deposit funds to L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee.mul(2),
  // });
  // // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  const zkmochisContract = await deployer.deploy(artifact, [baseURL]);

  //obtain the Constructor Arguments
  console.log(
    "Constructor args:" + zkmochisContract.interface.encodeDeploy([baseURL])
  );

  // Show the contract info.
  const contractAddress = zkmochisContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // verify contract for tesnet & mainnet
  if (process.env.NODE_ENV != "test") {
    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const contractFullyQualifedName = "contracts/ZkMochi.sol:ZkMochi";

    // Verify contract programmatically
    const verificationId = await hre.run("verify:verify", {
      address: contractAddress,
      contract: contractFullyQualifedName,
      constructorArguments: [baseURL],
      bytecode: artifact.bytecode,
    });
  } else {
    console.log(`Contract not verified, deployed locally.`);
  }
}
