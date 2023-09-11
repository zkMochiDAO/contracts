import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first!
import * as ContractArtifact from "../artifacts-zk/contracts/ZkMochi.sol/ZkMochi.json";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// Address of the contract on zksync mainnet
const CONTRACT_ADDRESS = "0x2F31ac0C3C4BC1ed24bDEBFEF33c3F2a756fA9b0";
// constructor args: args: 0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000036697066733a2f2f516d5741545751376656505032454647753731556b666e7168595844594835363671793437436e4a4467767338752f00000000000000000000

if (!CONTRACT_ADDRESS) throw "⛔️ Contract address not provided";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Initialize the provider.
  // @ts-ignore
  const provider = new Provider(hre.userConfig.networks?.zkSyncMainnet?.url);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Wallet address: " + signer.address)

  // Initialize contract instance
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ContractArtifact.abi,
    signer
  );
  
  // create 10000 mochis in batches of 255
//   const mochis = 10000;
//   const batch = 250;
//   const batches = Math.ceil(mochis / batch);
//   const price = await contract.estimateGas.mint(signer.address, batch);
//   console.log(`Price to mint ${batch} mochis is ${ethers.utils.formatEther(price)}`);

//   for (let i = 0; i < batches; i++) {
//     console.log(`Minting batch ${i + 1} of ${batches}`);
//     const tx = await contract.mint(signer.address, batch);
//     console.log(`Transaction to mint ${batch} mochis is ${tx.hash}`);
//     await tx.wait();
//   }
// }
