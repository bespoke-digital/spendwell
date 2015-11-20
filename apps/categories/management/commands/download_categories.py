
from django.core.management.base import BaseCommand
from django.conf import settings

from plaid import Client
import progressbar

from apps.categories.models import Category


class Command(BaseCommand):
    help = 'Download Plaid categories'

    def handle(self, *args, **options):
        plaid_client = Client(
            client_id=settings.PLAID_CLIENT_ID,
            secret=settings.PLAID_SECRET,
        )

        levels = [[], [], [], [], []]

        for category_data in plaid_client.categories().json():
            levels[len(category_data['hierarchy']) - 1].append(category_data)

        bar = progressbar.ProgressBar(max_value=len(plaid_client.categories().json()))
        bar_progress = 0
        bar.update(bar_progress)

        for level in levels:
            for category_data in level:
                try:
                    category = Category.objects.get(plaid_id=category_data['id'])
                except Category.DoesNotExist:
                    category = Category()
                    category.plaid_id = category_data['id']

                category.type = category_data['type']
                category.name = category_data['hierarchy'][-1]

                parent = None
                for parent_name in category_data['hierarchy'][0:-1]:
                    parent = Category.objects.get(name=parent_name, parent=parent)
                category.parent = parent

                category.save()

                bar_progress += 1
                bar.update(bar_progress)
