
import csv
from decimal import Decimal
from datetime import datetime

import graphene

from apps.core.schema import OwnedConnectionField
from apps.core.utils import instance_for_node_id
from apps.accounts.schema import AccountNode

from .models import Transaction
from .schema import TransactionNode


class UploadCsvMutation(graphene.relay.ClientIDMutation):
    class Input:
        account_id = graphene.ID()
        csv = graphene.String()

    account = graphene.Field(AccountNode)
    transactions = OwnedConnectionField(TransactionNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        account = instance_for_node_id(input.get('account_id'), info)

        new_transactions = []
        for row in csv.reader(input['csv'].split('\n')):
            if len(row) is not 5:
                continue

            [date, description, outgoing, incoming, balance] = row

            if incoming:
                amount = Decimal(incoming)
            elif outgoing:
                amount = -Decimal(outgoing)
            else:
                amount = Decimal(0)

            transaction, created = Transaction.objects.get_or_create(
                owner=info.request_context.user,
                account=account,
                description=description,
                amount=amount,
                date=datetime.strptime(date, '%m/%d/%Y'),
                balance=Decimal(balance),
                source='csv',
            )

            new_transactions.append(transaction)

        return UploadCsvMutation(
            account=account,
            transactions=new_transactions,
        )


class TransactionsMutations(graphene.ObjectType):
    upload_csv_mutation = graphene.Field(UploadCsvMutation)

    class Meta:
        abstract = True
