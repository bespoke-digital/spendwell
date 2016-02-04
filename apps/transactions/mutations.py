
import graphene

from apps.core.schema import OwnedConnectionField
from apps.core.utils import instance_for_node_id

from .schema import TransactionNode


class UploadCsvMutation(graphene.relay.ClientIDMutation):
    class Input:
        account_id = graphene.ID()
        csv = graphene.String()

    transactions = OwnedConnectionField(TransactionNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        account = instance_for_node_id(input.get('account_id'))
        print('account', account)
        print('csv', input['csv'])
        return UploadCsvMutation(transactions=account.transactions)


class TransactionsMutations(graphene.ObjectType):
    upload_csv_mutation = graphene.Field(UploadCsvMutation)

    class Meta:
        abstract = True
