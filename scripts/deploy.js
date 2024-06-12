const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const initBalance = ethers.utils.parseEther("100"); // initial balance 
  const dailyLimit = ethers.utils.parseEther("10000"); // daily limit

  const Assessment = await hre.ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy(dailyLimit, { value: initBalance });

  await assessment.deployed();

  console.log(`Contract deployed to ${assessment.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
