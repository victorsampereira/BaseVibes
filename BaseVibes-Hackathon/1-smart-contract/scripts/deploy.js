const hre = require("hardhat");

async function main() {
  const baseVibe = await hre.ethers.deployContract("BaseVibe");

  await baseVibe.waitForDeployment();

  console.log(
    `BaseVibe deployed to: ${baseVibe.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
