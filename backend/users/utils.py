from web3 import Web3
from django.conf import settings

def get_web3():
    """
    Returns a Web3 instance connected to the local Hardhat network.
    """
    w3 = Web3(Web3.HTTPProvider(settings.GANACHE_RPC_URL))
    if not w3.is_connected():
        raise Exception("Cannot connect to the local blockchain. Is Hardhat running?")
    return w3

def assign_wallet_address():
    """
    Assigns the first available Ganache account to a new user.
    - Skips the system wallet (account 0) reserved for finalization
    - Skips addresses already assigned to existing users
    - Returns the first available address
    - Raises an exception if all accounts are taken
    """
    from users.models import User

    w3 = get_web3()
    all_accounts = w3.eth.accounts

    # get all wallet addresses already assigned in the database
    assigned = set(
        User.objects.exclude(wallet_address='')
                    .exclude(wallet_address=None)
                    .exclude(wallet_address='reserved')
                    .values_list('wallet_address', flat=True)
    )

    # skip system wallet and already assigned addresses
    for account in all_accounts:
        if account == settings.SYSTEM_WALLET:
            continue  # ← skip account 0
        if account not in assigned:
            return account

    raise Exception("No available wallet addresses. All Ganache accounts are assigned.")