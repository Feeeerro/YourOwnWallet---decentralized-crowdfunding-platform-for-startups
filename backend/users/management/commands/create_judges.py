from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Creates the 3 default judges needed for campaign approval'

    def handle(self, *args, **kwargs):
        judges = [
            {
                'username': 'judge1',
                'email': 'judge1@yourownwallet.com',
                'password': 'testpass123',
                'first_name': 'Judge',
                'last_name': 'One',
            },
            {
                'username': 'judge2',
                'email': 'judge2@yourownwallet.com',
                'password': 'testpass123',
                'first_name': 'Judge',
                'last_name': 'Two',
            },
            {
                'username': 'judge3',
                'email': 'judge3@yourownwallet.com',
                'password': 'testpass123',
                'first_name': 'Judge',
                'last_name': 'Three',
            },
        ]

        for judge_data in judges:
            if User.objects.filter(username=judge_data['username']).exists():
                self.stdout.write(
                    self.style.WARNING(f"Judge '{judge_data['username']}' already exists — skipping")
                )
                continue

            User.objects.create_user(
                username=judge_data['username'],
                email=judge_data['email'],
                password=judge_data['password'],
                first_name=judge_data['first_name'],
                last_name=judge_data['last_name'],
                role='judge',
            )
            self.stdout.write(
                self.style.SUCCESS(f"Created judge '{judge_data['username']}'")
            )

        self.stdout.write(self.style.SUCCESS('\nDone! Judge wallet addresses:'))
        for judge in User.objects.filter(role='judge'):
            self.stdout.write(f"  {judge.username}: {judge.wallet_address}")