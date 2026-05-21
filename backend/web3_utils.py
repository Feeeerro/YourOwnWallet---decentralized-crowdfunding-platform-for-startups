from web3 import Web3
from django.conf import settings
import json
import os

def get_web3():
    """Connect to the local blockchain (Ganache)."""
    w3 = Web3(Web3.HTTPProvider(settings.GANACHE_RPC_URL))
    if not w3.is_connected():
        raise Exception("Cannot connect to the blockchain. Is Ganache running?")
    return w3


def load_abi(contract_name):
    """
    Load the ABI of a compiled contract from the Hardhat artifacts folder.
    The ABI is needed to interact with a deployed contract.
    """
    artifact_path = os.path.join(
        '/blockchain',
        'artifacts',
        'contracts',
        f'{contract_name}.sol',
        f'{contract_name}.json'
    )
    with open(artifact_path) as f:
        artifact = json.load(f)
    return artifact['abi']

def load_bytecode(contract_name):
    """
    Load the bytecode of a compiled contract.
    The bytecode is needed to deploy a new contract instance.
    """
    artifact_path = os.path.join(
        '/blockchain',
        'artifacts',
        'contracts',
        f'{contract_name}.sol',
        f'{contract_name}.json'
    )
    with open(artifact_path) as f:
        artifact = json.load(f)
    return artifact['bytecode']


def get_campaign_approval_contract(approval_address):
    """
    Returns a Web3 contract instance for CampaignApproval
    at the given address.
    """
    w3 = get_web3()
    abi = load_abi('CampaignApproval')
    return w3.eth.contract(address=approval_address, abi=abi)


def get_campaign_contract(campaign_address):
    """
    Returns a Web3 contract instance for Campaign
    at the given address.
    """
    w3 = get_web3()
    abi = load_abi('Campaign')
    return w3.eth.contract(address=campaign_address, abi=abi)

def deploy_campaign_contracts(deployer_address, judge_addresses, campaign_name, target_eth, duration_days):
    """
    Deploys a new pair of CampaignApproval and Campaign contracts.
    Called automatically when a new campaign is created via the API.

    Returns:
        tuple: (campaign_address, approval_address)
    """
    w3 = get_web3()

    # ─── 1. Deploy CampaignApproval ──────────────────────────────────
    approval_abi      = load_abi('CampaignApproval')
    approval_bytecode = load_bytecode('CampaignApproval')

    approval_contract = w3.eth.contract(abi=approval_abi, bytecode=approval_bytecode)
    approval_tx = approval_contract.constructor(
        judge_addresses
    ).transact({'from': deployer_address})
    approval_receipt = w3.eth.wait_for_transaction_receipt(approval_tx)
    approval_address = approval_receipt.contractAddress

    # ─── 2. Deploy Campaign ──────────────────────────────────────────
    campaign_abi      = load_abi('Campaign')
    campaign_bytecode = load_bytecode('Campaign')

    # convert target from ETH to wei
    target_wei = w3.to_wei(float(target_eth), 'ether')

    campaign_contract = w3.eth.contract(abi=campaign_abi, bytecode=campaign_bytecode)
    campaign_tx = campaign_contract.constructor(
        campaign_name,
        target_wei,
        duration_days,
        approval_address
    ).transact({'from': deployer_address})
    campaign_receipt = w3.eth.wait_for_transaction_receipt(campaign_tx)
    campaign_address = campaign_receipt.contractAddress

    return campaign_address, approval_address