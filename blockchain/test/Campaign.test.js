const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Test suite for CampaignApproval and Campaign contracts.
 * 
 * Structure:
 * 1. CampaignApproval tests
 *    - Deployment
 *    - Approval logic
 *    - Rejection logic
 *    - Edge cases
 * 
 * 2. Campaign tests
 *    - Deployment
 *    - Activation
 *    - Funding
 *    - Finalization (success and failure)
 *    - Withdrawal
 *    - Refunds
 *    - Edge cases
 */

describe("CampaignApproval", function () {

  // ─── Setup ─────────────────────────────────────────────────────────────

  /**
   * Runs before each test — deploys a fresh CampaignApproval contract
   * so every test starts with a clean state.
   */
  let campaignApproval;
  let deployer, judge1, judge2, judge3, stranger;

  beforeEach(async function () {
    [deployer, judge1, judge2, judge3, stranger] = await ethers.getSigners();

    const CampaignApproval = await ethers.getContractFactory("CampaignApproval");
    campaignApproval = await CampaignApproval.deploy(
      [judge1.address, judge2.address, judge3.address],
      ethers.ZeroAddress  // placeholder campaign address for these tests
    );
  });

  // ─── Deployment ────────────────────────────────────────────────────────

  describe("Deployment", function () {

    it("Should set the correct judges", async function () {
      const judges = await campaignApproval.getJudges();
      expect(judges[0]).to.equal(judge1.address);
      expect(judges[1]).to.equal(judge2.address);
      expect(judges[2]).to.equal(judge3.address);
    });

    it("Should start with approvalCount = 0", async function () {
      expect(await campaignApproval.approvalCount()).to.equal(0);
    });

    it("Should start with approved = false", async function () {
      expect(await campaignApproval.approved()).to.equal(false);
    });

    it("Should start with rejected = false", async function () {
      expect(await campaignApproval.rejected()).to.equal(false);
    });

  });

  // ─── Approval logic ────────────────────────────────────────────────────

  describe("Approval", function () {

    it("Should allow a judge to approve", async function () {
      await campaignApproval.connect(judge1).approve();
      expect(await campaignApproval.approvalCount()).to.equal(1);
      expect(await campaignApproval.hasApproved(judge1.address)).to.equal(true);
    });

    it("Should emit JudgeApproved event when a judge approves", async function () {
      await expect(campaignApproval.connect(judge1).approve())
        .to.emit(campaignApproval, "JudgeApproved")
        .withArgs(judge1.address);
    });

    it("Should not allow a non-judge to approve", async function () {
      await expect(campaignApproval.connect(stranger).approve())
        .to.be.revertedWith("Not a judge");
    });

    it("Should not allow a judge to approve twice", async function () {
      await campaignApproval.connect(judge1).approve();
      await expect(campaignApproval.connect(judge1).approve())
        .to.be.revertedWith("Already approved");
    });

    it("Should set approved = true when all 3 judges approve", async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      expect(await campaignApproval.approved()).to.equal(true);
    });

    it("Should emit CampaignFullyApproved when all 3 judges approve", async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await expect(campaignApproval.connect(judge3).approve())
        .to.emit(campaignApproval, "CampaignFullyApproved");
    });

    it("Should not allow approval after rejection", async function () {
      await campaignApproval.connect(judge1).reject();
      await expect(campaignApproval.connect(judge2).approve())
        .to.be.revertedWith("Already finalized");
    });

  });

  // ─── Rejection logic ───────────────────────────────────────────────────

  describe("Rejection", function () {

    it("Should allow a judge to reject", async function () {
      await campaignApproval.connect(judge1).reject();
      expect(await campaignApproval.rejected()).to.equal(true);
    });

    it("Should emit JudgeRejected event when a judge rejects", async function () {
      await expect(campaignApproval.connect(judge1).reject())
        .to.emit(campaignApproval, "JudgeRejected")
        .withArgs(judge1.address);
    });

    it("Should emit CampaignRejected event when a judge rejects", async function () {
      await expect(campaignApproval.connect(judge1).reject())
        .to.emit(campaignApproval, "CampaignRejected")
        .withArgs(judge1.address);
    });

    it("Should not allow a non-judge to reject", async function () {
      await expect(campaignApproval.connect(stranger).reject())
        .to.be.revertedWith("Not a judge");
    });

    it("Should not allow rejection after full approval", async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await expect(campaignApproval.connect(judge1).reject())
        .to.be.revertedWith("Already finalized");
    });

    it("Should not allow a judge to reject twice", async function () {
      await campaignApproval.connect(judge1).reject();
      await expect(campaignApproval.connect(judge1).reject())
        .to.be.revertedWith("Already finalized");
    });

  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe("Campaign", function () {

  // ─── Setup ─────────────────────────────────────────────────────────────

  let campaignApproval, campaign;
  let owner, judge1, judge2, judge3, investor1, investor2, stranger;

  const CAMPAIGN_NAME    = "Test Campaign";
  const TARGET_ETH       = ethers.parseEther("10");  // 10 ETH goal
  const DURATION_DAYS    = 30;

  beforeEach(async function () {
    [owner, judge1, judge2, judge3, investor1, investor2, stranger] = await ethers.getSigners();

    // Deploy CampaignApproval first
    const CampaignApproval = await ethers.getContractFactory("CampaignApproval");
    campaignApproval = await CampaignApproval.deploy(
      [judge1.address, judge2.address, judge3.address],
      ethers.ZeroAddress
    );

    // Deploy Campaign linked to the approval contract
    const Campaign = await ethers.getContractFactory("Campaign");
    campaign = await Campaign.deploy(
      CAMPAIGN_NAME,
      TARGET_ETH,
      DURATION_DAYS,
      await campaignApproval.getAddress()
    );
  });

  // ─── Deployment ────────────────────────────────────────────────────────

  describe("Deployment", function () {

    it("Should set the correct owner", async function () {
      expect(await campaign.owner()).to.equal(owner.address);
    });

    it("Should set the correct name", async function () {
      expect(await campaign.name()).to.equal(CAMPAIGN_NAME);
    });

    it("Should set the correct target", async function () {
      expect(await campaign.fundingTarget()).to.equal(TARGET_ETH);
    });

    it("Should start with status Pending (0)", async function () {
      expect(await campaign.status()).to.equal(0);
    });

    it("Should start with totalFunded = 0", async function () {
      expect(await campaign.totalFunded()).to.equal(0);
    });

    it("Should link to the correct approval contract", async function () {
      expect(await campaign.approvalContract()).to.equal(
        await campaignApproval.getAddress()
      );
    });

  });

  // ─── Activation ────────────────────────────────────────────────────────

  describe("Activation", function () {

    it("Should activate after all judges approve", async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await campaign.activate();
      expect(await campaign.status()).to.equal(1); // Active
    });

    it("Should emit CampaignActivated on activation", async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await expect(campaign.activate())
        .to.emit(campaign, "CampaignActivated");
    });

    it("Should not activate if not all judges approved", async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      // judge3 has not approved yet
      await expect(campaign.activate())
        .to.be.revertedWith("Not approved by judges yet");
    });

    it("Should not activate if already active", async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await campaign.activate();
      await expect(campaign.activate())
        .to.be.revertedWith("Not pending");
    });

    it("Should mark as rejected if judges rejected", async function () {
      await campaignApproval.connect(judge1).reject();
      await campaign.markRejected();
      expect(await campaign.status()).to.equal(4); // Rejected
    });

    it("Should not mark as rejected if judges did not reject", async function () {
      await expect(campaign.markRejected())
        .to.be.revertedWith("Not rejected");
    });

  });

  // ─── Funding ───────────────────────────────────────────────────────────

  describe("Funding", function () {

    // Helper: approve and activate the campaign before funding tests
    beforeEach(async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await campaign.activate();
    });

    it("Should accept funds from an investor", async function () {
      const amount = ethers.parseEther("1");
      await campaign.connect(investor1).fund({ value: amount });
      expect(await campaign.totalFunded()).to.equal(amount);
    });

    it("Should emit FundReceived event", async function () {
      const amount = ethers.parseEther("1");
      await expect(campaign.connect(investor1).fund({ value: amount }))
        .to.emit(campaign, "FundReceived")
        .withArgs(investor1.address, amount);
    });

    it("Should track individual investments", async function () {
      const amount = ethers.parseEther("2");
      await campaign.connect(investor1).fund({ value: amount });
      expect(await campaign.investments(investor1.address)).to.equal(amount);
    });

    it("Should accumulate multiple contributions from same investor", async function () {
      await campaign.connect(investor1).fund({ value: ethers.parseEther("1") });
      await campaign.connect(investor1).fund({ value: ethers.parseEther("2") });
      expect(await campaign.investments(investor1.address))
        .to.equal(ethers.parseEther("3"));
    });

    it("Should not accept 0 ETH", async function () {
      await expect(campaign.connect(investor1).fund({ value: 0 }))
        .to.be.revertedWith("Must send ETH");
    });

    it("Should not accept funds if campaign is not active", async function () {
      const Campaign = await ethers.getContractFactory("Campaign");
      const newCampaign = await Campaign.deploy(
        "Pending Campaign",
        TARGET_ETH,
        DURATION_DAYS,
        await campaignApproval.getAddress()
      );
      await expect(newCampaign.connect(investor1).fund({ value: ethers.parseEther("1") }))
        .to.be.revertedWith("Campaign is not active");
    });

    it("Should not accept funds after deadline", async function () {
      // Fast forward time by 31 days
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(campaign.connect(investor1).fund({ value: ethers.parseEther("1") }))
        .to.be.revertedWith("Campaign deadline passed");
    });

  });

  // ─── Finalization ──────────────────────────────────────────────────────

  describe("Finalization", function () {

    beforeEach(async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await campaign.activate();
    });

    it("Should finalize as Succeeded when goal is reached", async function () {
      await campaign.connect(investor1).fund({ value: ethers.parseEther("10") });

      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await campaign.finalize();
      expect(await campaign.status()).to.equal(2); // Succeeded
    });

    it("Should finalize as Failed when goal is not reached", async function () {
      await campaign.connect(investor1).fund({ value: ethers.parseEther("3") });

      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await campaign.finalize();
      expect(await campaign.status()).to.equal(3); // Failed
    });

    it("Should emit CampaignFinalized event", async function () {
      await campaign.connect(investor1).fund({ value: ethers.parseEther("10") });

      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(campaign.finalize())
        .to.emit(campaign, "CampaignFinalized")
        .withArgs(true);
    });

    it("Should not finalize before deadline", async function () {
      await expect(campaign.finalize())
        .to.be.revertedWith("Campaign still ongoing");
    });

    it("Should not finalize if not active", async function () {
      const Campaign = await ethers.getContractFactory("Campaign");
      const newCampaign = await Campaign.deploy(
        "Pending Campaign",
        TARGET_ETH,
        DURATION_DAYS,
        await campaignApproval.getAddress()
      );
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await expect(newCampaign.finalize())
        .to.be.revertedWith("Campaign not active");
    });

  });

  // ─── Withdrawal ────────────────────────────────────────────────────────

  describe("Withdrawal", function () {

    beforeEach(async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await campaign.activate();
      await campaign.connect(investor1).fund({ value: ethers.parseEther("10") });
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await campaign.finalize();
    });

    it("Should allow owner to withdraw after success", async function () {
      await expect(campaign.connect(owner).withdraw())
        .to.emit(campaign, "FundsWithdrawn");
    });

    it("Should transfer the full balance to the owner", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await campaign.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * tx.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore - gasUsed);
    });

    it("Should not allow double withdrawal", async function () {
      await campaign.connect(owner).withdraw();
      await expect(campaign.connect(owner).withdraw())
        .to.be.revertedWith("Already withdrawn");
    });

    it("Should not allow a non-owner to withdraw", async function () {
      await expect(campaign.connect(stranger).withdraw())
        .to.be.revertedWith("Not the campaign owner");
    });

  });

  // ─── Refunds ───────────────────────────────────────────────────────────

  describe("Refunds", function () {

    beforeEach(async function () {
      await campaignApproval.connect(judge1).approve();
      await campaignApproval.connect(judge2).approve();
      await campaignApproval.connect(judge3).approve();
      await campaign.activate();
      // Fund below the target so the campaign fails
      await campaign.connect(investor1).fund({ value: ethers.parseEther("3") });
      await campaign.connect(investor2).fund({ value: ethers.parseEther("2") });
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await campaign.finalize();
    });

    it("Should allow investor to claim refund after failure", async function () {
      await expect(campaign.connect(investor1).claimRefund())
        .to.emit(campaign, "RefundSent")
        .withArgs(investor1.address, ethers.parseEther("3"));
    });

    it("Should reset investment to 0 after refund", async function () {
      await campaign.connect(investor1).claimRefund();
      expect(await campaign.investments(investor1.address)).to.equal(0);
    });

    it("Should not allow double refund", async function () {
      await campaign.connect(investor1).claimRefund();
      await expect(campaign.connect(investor1).claimRefund())
        .to.be.revertedWith("No investment to refund");
    });

    it("Should not allow refund if campaign succeeded", async function () {
      // Deploy a new campaign that succeeds
      const Campaign = await ethers.getContractFactory("Campaign");
      const successCampaign = await Campaign.deploy(
        "Success Campaign",
        TARGET_ETH,
        DURATION_DAYS,
        await campaignApproval.getAddress()
      );
      await successCampaign.activate();
      await successCampaign.connect(investor1).fund({ value: ethers.parseEther("10") });
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await successCampaign.finalize();
      await expect(successCampaign.connect(investor1).claimRefund())
        .to.be.revertedWith("Campaign did not fail");
    });

    it("Should not allow refund if no investment was made", async function () {
      await expect(campaign.connect(stranger).claimRefund())
        .to.be.revertedWith("No investment to refund");
    });

  });

});