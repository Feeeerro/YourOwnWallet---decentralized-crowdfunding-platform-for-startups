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