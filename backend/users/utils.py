from web3 import Web3
from django.conf import settings

def get_web3():
    """
    Returns a Web3 instance connected to the local Hardhat network.
    """
    w3 = Web3(Web3.HTTPProvider(settings.HARDHAT_RPC_URL))
    if not w3.is_connected():
        raise Exception("Cannot connect to the local blockchain. Is Hardhat running?")
    return w3

def assign_wallet_address():
    """
    Assigns the first available Hardhat account to a new user.
    - Gets all 20 Hardhat accounts
    - Checks which ones are already assigned in the database
    - Returns the first available one
    - Raises an exception if all 20 are taken
    """
    from users.models import User  # import here to avoid circular imports

    w3 = get_web3()

    # Get all 20 Hardhat accounts
    all_accounts = w3.eth.accounts

    # Get all wallet addresses already assigned in the database
    assigned = set(
        User.objects.exclude(wallet_address='')
                    .exclude(wallet_address=None)
                    .values_list('wallet_address', flat=True)
    )

    # Return the first account not yet assigned
    for account in all_accounts:
        if account not in assigned:
            return account

    raise Exception("No available wallet addresses. All 20 Hardhat accounts are assigned.")