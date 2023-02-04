const hre = require("hardhat");
const fs = require('fs');
const fse = require("fs-extra");
const { verify } = require('../utils/verify')
const { getAmountInWei, developmentChains } = require('../utils/helper-scripts');


async function main() {
  const deployNetwork = hre.network.name

  const postingFee = getAmountInWei(0.001);
  const MediumBlog = await hre.ethers.getContractFactory("MediumBlog");
  const blog = await MediumBlog.deploy(postingFee);

  await blog.deployed();

  console.log("medium blog deployed at:", blog.address);
  console.log("Network deployed to :", deployNetwork);

  /* this code writes the contract addresses to a local */
  /* file named config.js that we can use in the app */
  if (fs.existsSync("../src")) {
    fs.rmSync("../src/artifacts", { recursive: true, force: true });
    fse.copySync("./artifacts/contracts", "../src/artifacts")
    fs.writeFileSync('../src/utils/contracts-config.js', `
  export const contractAddress = "${blog.address}"
  export const ownerAddress = "${blog.signer.address}"
  export const networkDeployedTo = "${hre.network.config.chainId}"
  `)
  }

  if (!developmentChains.includes(deployNetwork) && hre.config.etherscan.apiKey[deployNetwork]) {
    console.log("waiting for 6 blocks verification ...")
    await blog.deployTransaction.wait(6)

    // args represent contract constructor arguments
    const args = [postingFee]
    await verify(blog.address, args)
  }
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
