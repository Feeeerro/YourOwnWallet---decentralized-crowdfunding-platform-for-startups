// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the CampaignApproval contract so we can call its functions
import "./CampaignApproval.sol";

/**
 * @title Campaign
 * @notice This contract handles the full lifecycle of a funding campaign:
 *         creation → approval → funding → finalization → withdrawal or refund.
 * @dev The Campaign contract reads from CampaignApproval to know if judges
 *      have approved or rejected the campaign before allowing any funding.
 *
 *      Lifecycle:
 *      1. Campaign is deployed with Status.Pending
 *      2. Judges vote in CampaignApproval
 *      3. Anyone calls activate() once all judges approve → Status.Active
 *      4. Investors send ETH via fund() before the deadline
 *      5. After deadline, anyone calls finalize():
 *         - If totalFunded >= target → Status.Succeeded → owner can withdraw
 *         - If totalFunded < target  → Status.Failed    → investors can claim refund
 */
contract Campaign {

    // ─── State variables ───────────────────────────────────────────────

    /// @notice The wallet address of the startup that created the campaign
    address public owner;

    /// @notice The name of the campaign
    string public name;

    /// @notice The funding goal in wei (1 ETH = 10^18 wei)
    uint256 public fundingTarget;

    /// @notice Unix timestamp of when the campaign ends
    uint256 public deadline;

    /// @notice Total amount of ETH received from all investors (in wei)
    uint256 public totalFunded;

    /// @notice True once the owner has withdrawn the funds after success
    bool public withdrawn;

    /// @notice Reference to the linked CampaignApproval contract
    CampaignApproval public approvalContract;

    // ─── Investors ─────────────────────────────────────────────────────

    /// @notice Maps each investor address to how much ETH they have sent (in wei)
    mapping(address => uint256) public investments;

    /// @notice List of all investor addresses (used for iteration if needed)
    address[] public investors;

    // ─── Status ────────────────────────────────────────────────────────

    /**
     * @notice The current state of the campaign.
     * @dev Pending   → waiting for judge approval
     *      Active    → approved and accepting funds
     *      Succeeded → deadline passed and goal reached
     *      Failed    → deadline passed and goal not reached
     *      Rejected  → judges rejected the campaign
     */
    enum Status { Pending, Active, Succeeded, Failed, Rejected }
    Status public status;

    // ─── Events ────────────────────────────────────────────────────────

    /// @notice Emitted when the campaign is activated after full judge approval
    event CampaignActivated();

    /// @notice Emitted when an investor sends ETH to the campaign
    event FundReceived(address investor, uint256 amount);

    /// @notice Emitted when the owner withdraws funds after a successful campaign
    event FundsWithdrawn(address owner, uint256 amount);

    /// @notice Emitted when an investor claims their refund after a failed campaign
    event RefundSent(address investor, uint256 amount);

    /// @notice Emitted when the campaign is finalized, with the result
    event CampaignFinalized(bool succeeded);

    // ─── Modifiers ─────────────────────────────────────────────────────

    /**
     * @dev Restricts a function to only the campaign owner (the startup).
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the campaign owner");
        _;
    }

    /**
     * @dev Ensures the campaign is active and the deadline has not passed.
     *      Used to gate the fund() function.
     */
    modifier onlyWhenActive() {
        require(status == Status.Active, "Campaign is not active");
        require(block.timestamp < deadline, "Campaign deadline passed");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────

    /**
     * @notice Deploys the Campaign contract.
     * @param _name The name of the campaign
     * @param _fundingTarget The funding goal in wei
     * @param _durationDays How many days the campaign will run once activated
     * @param _approvalContract The address of the already-deployed CampaignApproval contract
     */
    constructor(
        string memory _name,
        uint256 _fundingTarget,
        uint256 _durationDays,
        address _approvalContract
    ) {
        owner            = msg.sender;                                        // the deployer is the owner
        name             = _name;
        fundingTarget           = _fundingTarget;
        deadline         = block.timestamp + (_durationDays * 1 days);        // calculate deadline from now
        approvalContract = CampaignApproval(_approvalContract);               // link to the approval contract
        status           = Status.Pending;                                    // start in pending state
    }

    // ─── Activation ────────────────────────────────────────────────────

    /**
     * @notice Activates the campaign after all judges have approved.
     * @dev Anyone can call this once isApproved() returns true.
     *      This moves the status from Pending to Active,
     *      allowing investors to start sending funds.
     */
    function activate() external {
        require(status == Status.Pending, "Not pending");
        require(approvalContract.isApproved(), "Not approved by judges yet");

        status = Status.Active;
        emit CampaignActivated();
    }

    /**
     * @notice Marks the campaign as rejected if judges have rejected it.
     * @dev Anyone can call this once isRejected() returns true.
     *      A rejected campaign cannot be activated or funded.
     */
    function markRejected() external {
        require(status == Status.Pending, "Not pending");
        require(approvalContract.isRejected(), "Not rejected");

        status = Status.Rejected;
    }

    // ─── Investor functions ────────────────────────────────────────────

    /**
     * @notice Allows an investor to send ETH to fund the campaign.
     * @dev The ETH is held inside this contract until finalization.
     *      The investor is added to the investors list on their first contribution.
     *      Multiple contributions from the same address are accumulated.
     */
    function fund() external payable onlyWhenActive {
        require(msg.value > 0, "Must send ETH");

        // add investor to the list only on their first contribution
        if (investments[msg.sender] == 0) {
            investors.push(msg.sender);
        }

        investments[msg.sender] += msg.value;  // record how much this investor sent
        totalFunded += msg.value;               // update the total funded amount

        emit FundReceived(msg.sender, msg.value);
    }

    // ─── End of campaign ───────────────────────────────────────────────

    /**
     * @notice Finalizes the campaign after the deadline has passed.
     * @dev Anyone can call this after the deadline.
     *      If goal reached → Succeeded (owner can withdraw)
     *      If goal not reached → Failed (investors can claim refunds)
     */
    function finalize() external {
        require(status == Status.Active, "Campaign not active");
        require(block.timestamp >= deadline, "Campaign still ongoing");

        if (totalFunded >= fundingTarget) {
            status = Status.Succeeded;  // goal reached
        } else {
            status = Status.Failed;     // goal not reached
        }

        emit CampaignFinalized(totalFunded >= fundingTarget);
    }

    /**
     * @notice Allows the campaign owner to withdraw funds after success.
     * @dev Can only be called once (withdrawn flag prevents double withdrawal).
     *      Transfers the entire contract balance to the owner.
     */
    function withdraw() external onlyOwner {
        require(status == Status.Succeeded, "Campaign did not succeed");
        require(!withdrawn, "Already withdrawn");

        withdrawn = true;                         // mark as withdrawn before transfer (reentrancy protection)
        uint256 amount = address(this).balance;   // get the full contract balance
        payable(owner).transfer(amount);          // send ETH to the owner

        emit FundsWithdrawn(owner, amount);
    }

    /**
     * @notice Allows an investor to claim a refund after a failed campaign.
     * @dev The investment amount is set to 0 before transfer (reentrancy protection).
     *      Only investors who contributed can claim a refund.
     */
    function claimRefund() external {
        require(status == Status.Failed, "Campaign did not fail");

        uint256 amount = investments[msg.sender];
        require(amount > 0, "No investment to refund");

        investments[msg.sender] = 0;      // reset before transfer (reentrancy protection)
        payable(msg.sender).transfer(amount);  // send ETH back to the investor

        emit RefundSent(msg.sender, amount);
    }

    // ─── View functions ────────────────────────────────────────────────

    /**
     * @notice Returns the list of all investor addresses.
     */
    function getInvestors() external view returns (address[] memory) {
        return investors;
    }

    /**
     * @notice Returns the current ETH balance held in this contract (in wei).
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}