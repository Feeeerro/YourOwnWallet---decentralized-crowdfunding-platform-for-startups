// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CampaignApproval
 * @notice This contract handles the approval or rejection of a campaign by a panel of 3 judges.
 * @dev This contract is deployed first, then its address is passed to the Campaign contract.
 *      All 3 judges must approve for the campaign to be considered approved.
 *      A single rejection is enough to reject the campaign.
 */
contract CampaignApproval {

    // ─── State variables ───────────────────────────────────────────────

    /// @notice The 3 judge addresses — fixed at deployment, cannot be changed
    address[3] public judges;

    /// @notice Tracks whether each judge has already approved
    mapping(address => bool) public hasApproved;

    /// @notice Tracks whether each judge has already rejected
    mapping(address => bool) public hasRejected;

    /// @notice How many judges have approved so far (max 3)
    uint8 public approvalCount;

    /// @notice True when all 3 judges have approved
    bool public approved;

    /// @notice True when at least one judge has rejected
    bool public rejected;

    // ─── Events ────────────────────────────────────────────────────────

    /// @notice Emitted when a single judge approves
    event JudgeApproved(address judge);

    /// @notice Emitted when a single judge rejects
    event JudgeRejected(address judge);

    /// @notice Emitted when all 3 judges have approved
    event CampaignFullyApproved();

    /// @notice Emitted when any judge rejects the campaign
    event CampaignRejected(address judge);

    // ─── Modifiers ─────────────────────────────────────────────────────

    /**
     * @dev Restricts a function to only the 3 registered judges.
     *      Reverts with an error message if the caller is not a judge.
     */
    modifier onlyJudge() {
        require(_isJudge(msg.sender), "Not a judge");
        _;
    }

    /**
     * @dev Prevents actions after the campaign has already been
     *      fully approved or rejected.
     */
    modifier notFinalized() {
        require(!approved && !rejected, "Already finalized");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────

    /**
     * @notice Deploys the approval contract.
     * @param _judges Array of exactly 3 judge wallet addresses
     */
    constructor(address[3] memory _judges) {
        judges          = _judges;
    }

    // ─── Judge functions ───────────────────────────────────────────────

    /**
     * @notice Called by a judge to approve the campaign.
     * @dev Once all 3 judges call this, `approved` becomes true
     *      and the CampaignFullyApproved event is emitted.
     *      Each judge can only approve once.
     */
    function approve() external onlyJudge notFinalized {
        require(!hasApproved[msg.sender], "Already approved");

        hasApproved[msg.sender] = true;  // mark this judge as having approved
        approvalCount++;                  // increment the approval counter

        emit JudgeApproved(msg.sender);

        // if all 3 judges have approved, mark the campaign as fully approved
        if (approvalCount == 3) {
            approved = true;
            emit CampaignFullyApproved();
        }
    }

    /**
     * @notice Called by a judge to reject the campaign.
     * @dev A single rejection is enough to block the campaign.
     *      Once rejected, no further approvals or rejections are accepted.
     *      Each judge can only reject once.
     */
    function reject() external onlyJudge notFinalized {
        require(!hasRejected[msg.sender], "Already rejected");

        hasRejected[msg.sender] = true;  // mark this judge as having rejected
        rejected = true;                  // one rejection is enough to block

        emit JudgeRejected(msg.sender);
        emit CampaignRejected(msg.sender);
    }

    // ─── View functions ────────────────────────────────────────────────

    /**
     * @notice Returns true if all 3 judges have approved.
     * @dev Called by the Campaign contract to check if it can activate.
     */
    function isApproved() external view returns (bool) {
        return approved;
    }

    /**
     * @notice Returns true if at least one judge has rejected.
     * @dev Called by the Campaign contract to mark itself as rejected.
     */
    function isRejected() external view returns (bool) {
        return rejected;
    }

    /**
     * @notice Returns the list of the 3 judge addresses.
     */
    function getJudges() external view returns (address[3] memory) {
        return judges;
    }

    // ─── Internal ──────────────────────────────────────────────────────

    /**
     * @dev Checks if a given address is one of the 3 registered judges.
     *      Used internally by the onlyJudge modifier.
     * @param _addr The address to check
     * @return True if the address is a judge, false otherwise
     */
    function _isJudge(address _addr) internal view returns (bool) {
        for (uint8 i = 0; i < 3; i++) {
            if (judges[i] == _addr) return true;
        }
        return false;
    }
}