
from django.core.management.base import BaseCommand

from apps.finicity.client import Finicity


class Command(BaseCommand):
    help = 'Delete Finicity test customers'

    def handle(self, *args, **options):
        client = Finicity(None)

        while True:
            customers = client.list_customers()
            if len(customers) == 0:
                break

            for customer in customers:
                print('deleted', customer['id'])
                client.delete_customer(customer['id'])
