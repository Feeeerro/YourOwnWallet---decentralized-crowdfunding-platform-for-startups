"""
Seeds the database with fictitious demo data:
- 1 demo startupper (owner of every demo startup and campaign)
- 1 demo investor (funds some of the active campaigns)
- 8 startups, each with 1 to 3 campaigns (random, but reproducible)

Every campaign is deployed on the local blockchain exactly like a real one
(CampaignApproval + Campaign contracts), so the demo data stays fully usable:
investors can fund it, judges can vote on the pending ones, etc.

Usage (inside the backend container):
    python manage.py seed_demo_data            # only if no startups exist yet
    python manage.py seed_demo_data --force    # add the demo data anyway
"""
import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from campaign.models import Campaign
from startup.models import Startup
from transaction.models import Transaction
from users.models import User
from web3_utils import (
    deploy_campaign_contracts,
    get_campaign_approval_contract,
    get_campaign_contract,
    get_web3,
)

DEMO_PASSWORD = 'testpass123'

DEMO_USERS = [
    {
        'username': 'demo_founder',
        'email': 'founder@yourownwallet.com',
        'first_name': 'Demo',
        'last_name': 'Founder',
        'role': 'startupper',
        'country': 'Italy',
        'city': 'Milan',
    },
    {
        'username': 'demo_investor',
        'email': 'investor@yourownwallet.com',
        'first_name': 'Demo',
        'last_name': 'Investor',
        'role': 'investor',
        'country': 'Switzerland',
        'city': 'Zurich',
    },
]

STARTUPS = [
    {
        'startup_name': 'NeuroLedger',
        'category': 'Technology',
        'country': 'Germany',
        'continent': 'europe',
        'address': 'Torstraße 140, 10119 Berlin',
        'description': 'An AI co-pilot that audits smart contracts in real time, flagging vulnerabilities before they reach mainnet. Built for DAOs and DeFi teams that ship fast.',
        'status': 'active',
        'campaigns': [
            ('NeuroLedger Seed Round', 'Funding the first production release of our AI audit engine and a public bug-bounty programme.'),
            ('Audit Engine v2', 'Multi-chain support (L2s and app-chains) plus a VS Code extension for continuous security checks.'),
            ('Open Security Dataset', 'An open dataset of 50k labelled exploits to train the next generation of security models.'),
        ],
    },
    {
        'startup_name': 'SolarGrid DAO',
        'category': 'Energy',
        'country': 'Kenya',
        'continent': 'africa',
        'address': 'Kenyatta Avenue 21, Nairobi',
        'description': 'Community-owned solar micro-grids. Investors finance panels, villages pay per kWh with mobile money and the revenue flows back on-chain.',
        'status': 'active',
        'campaigns': [
            ('Village Micro-Grid #1', 'Install a 120 kW micro-grid powering 400 households and a local health clinic.'),
            ('Battery Storage Expansion', 'Add lithium storage so the grid keeps running after sunset.'),
            ('Smart Meter Rollout', 'IoT meters that settle consumption directly on the blockchain.'),
        ],
    },
    {
        'startup_name': 'MediChain',
        'category': 'Healthcare',
        'country': 'Switzerland',
        'continent': 'europe',
        'address': 'Bahnhofstrasse 45, 8001 Zurich',
        'description': 'Patient-owned medical records secured with zero-knowledge proofs. Share your history with any doctor without giving up your privacy.',
        'status': 'active',
        'campaigns': [
            ('Patient Wallet Launch', 'Release the patient wallet app on iOS and Android with three partner hospitals.'),
            ('ZK Prescription Pilot', 'Verify prescriptions at pharmacies without revealing the diagnosis.'),
        ],
    },
    {
        'startup_name': 'EduVerse',
        'category': 'Education',
        'country': 'India',
        'continent': 'asia',
        'address': '80 Feet Road, Koramangala, Bengaluru',
        'description': 'Learn-to-earn platform where students collect verifiable on-chain credentials and scholarships unlock automatically when goals are met.',
        'status': 'active',
        'campaigns': [
            ('Scholarship Pool 2027', 'A transparent scholarship fund released automatically to students who complete their courses.'),
        ],
    },
    {
        'startup_name': 'AgriTrace',
        'category': 'Agriculture',
        'country': 'Brazil',
        'continent': 'south_america',
        'address': 'Avenida Paulista 1578, São Paulo',
        'description': 'Farm-to-fork traceability for coffee and cocoa. Every bag gets a digital passport so farmers earn a fair premium.',
        'status': 'active',
        'campaigns': [
            ('Coffee Passport Pilot', 'Tag 10,000 coffee bags from 60 small farms with tamper-proof NFC passports.'),
            ('Fair Premium Fund', 'Pay farmers a guaranteed premium directly through smart contracts.'),
        ],
    },
    {
        'startup_name': 'PixelForge Studios',
        'category': 'Entertainment',
        'country': 'Japan',
        'continent': 'asia',
        'address': '2-21-1 Shibuya, Tokyo',
        'description': 'Indie game studio building a co-op fantasy RPG where players truly own their items and can carry them across games.',
        'status': 'active',
        'campaigns': [
            ('Realm of Shards Alpha', 'Fund the closed alpha with 4 playable regions and cross-game inventory.'),
            ('Soundtrack & Lore Book', 'An orchestral soundtrack and illustrated lore book for early backers.'),
        ],
    },
    {
        'startup_name': 'UrbanMove',
        'category': 'Transportation',
        'country': 'Netherlands',
        'continent': 'europe',
        'address': 'Keizersgracht 520, Amsterdam',
        'description': 'Shared e-bike network run as a cooperative. Riders and investors share the revenue of every kilometre travelled.',
        'status': 'active',
        'campaigns': [
            ('500 E-Bikes for Amsterdam', 'Expand the fleet with 500 new e-bikes and 40 solar-powered docking stations.'),
            ('Rotterdam Expansion', 'Bring the cooperative model to a second city.'),
            ('Rider Rewards Programme', 'Token rewards for riders who rebalance bikes across the city.'),
        ],
    },
    {
        'startup_name': 'GreenVault',
        'category': 'Finance',
        'country': 'Canada',
        'continent': 'north_america',
        'address': '100 King St W, Toronto',
        'description': 'Tokenized carbon credits backed by verified reforestation projects. Offset your footprint with full transparency.',
        'status': 'pending',
        'campaigns': [
            ('Reforestation Bond #1', 'Plant 250,000 trees in British Columbia and tokenize the verified carbon credits.'),
            ('Carbon Oracle Network', 'Satellite-based oracles that verify forest growth every month.'),
        ],
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with demo startups and campaigns (deployed on the local blockchain)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Add the demo data even if startups already exist',
        )

    def handle(self, *args, **options):
        if Startup.objects.exists() and not options['force']:
            self.stdout.write(self.style.WARNING(
                'Startups already exist — skipping demo data (use --force to add it anyway).'
            ))
            return

        rng = random.Random(42)  # reproducible "random" data
        w3 = get_web3()

        judges = list(User.objects.filter(role='judge')[:3])
        if len(judges) < 3:
            self.stdout.write(self.style.ERROR('3 judges are required. Run "python manage.py create_judges" first.'))
            return
        judge_addresses = [j.wallet_address for j in judges]

        founder = self._get_or_create_user(DEMO_USERS[0])
        investor = self._get_or_create_user(DEMO_USERS[1])

        now = timezone.now()
        total_campaigns = 0

        for data in STARTUPS:
            campaigns_data = data['campaigns']
            startup = Startup.objects.create(
                created_by=founder,
                **{k: v for k, v in data.items() if k != 'campaigns'},
            )

            # 1 to 3 campaigns per startup
            how_many = rng.randint(1, min(3, len(campaigns_data)))
            for name, description in campaigns_data[:how_many]:
                target = Decimal(rng.choice([5, 8, 10, 12, 15, 20, 25, 30, 40, 50]))
                duration_days = rng.randint(14, 90)

                campaign_address, approval_address = deploy_campaign_contracts(
                    deployer_address=founder.wallet_address,
                    judge_addresses=judge_addresses,
                    campaign_name=name,
                    target_eth=target,
                    duration_days=duration_days,
                )

                campaign = Campaign.objects.create(
                    campaign_name=name,
                    description=description,
                    target=target,
                    deadline=now + timedelta(days=duration_days),
                    created_by=founder,
                    startup=startup,
                    status='pending',
                    campaign_address=campaign_address,
                    campaign_approval_address=approval_address,
                )

                roll = rng.random()
                if startup.status == 'pending' or roll < 0.25:
                    pass  # stays pending → judges can still vote on it
                elif roll < 0.32:
                    self._reject(w3, campaign, judge_addresses[0])
                else:
                    self._approve(w3, campaign, judge_addresses)
                    # fund most of the active campaigns with 10%–85% of the target
                    if rng.random() < 0.85:
                        share = Decimal(str(round(rng.uniform(0.10, 0.85), 2)))
                        self._fund(w3, campaign, investor, (target * share).quantize(Decimal('0.01')), rng)

                total_campaigns += 1
                self.stdout.write(f'  {startup.startup_name} → {name} [{campaign.status}]')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created {len(STARTUPS)} startups and {total_campaigns} campaigns.'
            f'\nDemo logins: demo_founder / demo_investor (password: {DEMO_PASSWORD})'
        ))

    # ─── helpers ────────────────────────────────────────────────────────

    def _get_or_create_user(self, data):
        user = User.objects.filter(username=data['username']).first()
        if user:
            return user
        return User.objects.create_user(password=DEMO_PASSWORD, **data)

    def _approve(self, w3, campaign, judge_addresses):
        approval = get_campaign_approval_contract(campaign.campaign_approval_address)
        for judge in judge_addresses:
            w3.eth.wait_for_transaction_receipt(approval.functions.approve().transact({'from': judge}))
        contract = get_campaign_contract(campaign.campaign_address)
        w3.eth.wait_for_transaction_receipt(
            contract.functions.activate().transact({'from': judge_addresses[0]})
        )
        campaign.status = 'active'
        campaign.save()

    def _reject(self, w3, campaign, judge_address):
        approval = get_campaign_approval_contract(campaign.campaign_approval_address)
        w3.eth.wait_for_transaction_receipt(approval.functions.reject().transact({'from': judge_address}))
        campaign.status = 'rejected'
        campaign.save()

    def _fund(self, w3, campaign, investor, amount, rng):
        contract = get_campaign_contract(campaign.campaign_address)
        # split the amount into 1-3 transactions so the history looks realistic
        parts = rng.randint(1, 3)
        remaining = amount
        for i in range(parts):
            chunk = remaining if i == parts - 1 else (amount / parts).quantize(Decimal('0.01'))
            remaining -= chunk
            if chunk <= 0:
                continue
            tx = contract.functions.fund().transact({
                'from': investor.wallet_address,
                'value': w3.to_wei(chunk, 'ether'),
            })
            w3.eth.wait_for_transaction_receipt(tx)
            Transaction.objects.create(sender=investor, campaign=campaign, amount=chunk)
        campaign.funded += amount
        campaign.save()
