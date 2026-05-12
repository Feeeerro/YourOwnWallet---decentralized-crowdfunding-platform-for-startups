const hre = require("hardhat");

async function main() {
  // Get the signers from the local Hardhat network
  // These are the 20 default accounts Hardhat generates automatically
  const [deployer, judge1, judge2, judge3] = await hre.ethers.getSigners();

  console.log("=".repeat(50));
  console.log("Deploying contracts...");
  console.log("=".repeat(50));
  console.log("Deployer address:", deployer.address);
  console.log("Judge 1 address: ", judge1.address);
  console.log("Judge 2 address: ", judge2.address);
  console.log("Judge 3 address: ", judge3.address);
  console.log("=".repeat(50));

  // ─── 1. Deploy CampaignApproval ──────────────────────────────────────
  // We deploy CampaignApproval first because Campaign needs its address

  console.log("\nDeploying CampaignApproval...");

  const CampaignApproval = await hre.ethers.getContractFactory("CampaignApproval");
  const campaignApproval = await CampaignApproval.deploy(
    [judge1.address, judge2.address, judge3.address],  // the 3 judges
    hre.ethers.ZeroAddress                              // campaign address — unknown at this point
  );
  await campaignApproval.waitForDeployment();

  const approvalAddress = await campaignApproval.getAddress();
  console.log("CampaignApproval deployed at:", approvalAddress);

  // ─── 2. Deploy Campaign ──────────────────────────────────────────────

  console.log("\nDeploying Campaign...");

  const Campaign = await hre.ethers.getContractFactory("Campaign");
  const campaign = await Campaign.deploy(
    "My First Campaign",                // campaign name
    hre.ethers.parseEther("10"),        // funding target: 10 ETH
    30,                                 // duration: 30 days
    approvalAddress                     // link to the approval contract
  );
  await campaign.waitForDeployment();

  const campaignAddress = await campaign.getAddress();
  console.log("Campaign deployed at:", campaignAddress);

  // ─── 3. Summary ──────────────────────────────────────────────────────

  console.log("\n" + "=".repeat(50));
  console.log("Deployment complete!");
  console.log("=".repeat(50));
  console.log("CampaignApproval:", approvalAddress);
  console.log("Campaign:        ", campaignAddress);
  console.log("\nJudge addresses to register in Django:");
  console.log("Judge 1:", judge1.address);
  console.log("Judge 2:", judge2.address);
  console.log("Judge 3:", judge3.address);
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });