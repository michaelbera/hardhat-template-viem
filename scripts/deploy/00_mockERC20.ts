import hre from "hardhat";
import path from "path";

import MockERC20Module from "../../ignition/modules/MockERC20.js";

async function main() {
  const connection = await hre.network.connect();
  const chainId = connection.networkConfig.chainId;

  const { mockERC20 } = await connection.ignition.deploy(MockERC20Module, {
    // This must be an absolute path to your parameters JSON file
    parameters: path.resolve(import.meta.dirname, `../../ignition/parameters/${chainId}.json`),
  });

  // or `counter.getAddress()` if you're using Ethers.js
  console.log(`MockERC20 deployed to: ${mockERC20.address}`);
}

main().catch(console.error);
