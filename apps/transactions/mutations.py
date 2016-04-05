
import graphene
from graphene.relay import ClientIDMutation

from apps.core.types import Month, Money
from apps.core.utils import instance_for_node_id

from .models import Transaction, IncomeFromSavings


class DetectTransfersMutation(ClientIDMutation):
    class Input:
        pass

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        Transaction.objects.detect_transfers(owner=info.request_context.user)

        return Cls(viewer=Viewer())


class SetIncomeFromSavingsMutation(graphene.relay.ClientIDMutation):
    class Input:
        month = graphene.InputField(Month)
        amount = graphene.InputField(Money)

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        IncomeFromSavings.objects.update_or_create(
            owner=info.request_context.user,
            month_start=input['month'],
            defaults={'amount': input['amount']}
        )

        return Cls(viewer=Viewer())


class TransactionQuickAddMutation(ClientIDMutation):
    class Input:
        transaction_id = graphene.InputField(graphene.ID())
        bucket_id = graphene.InputField(graphene.ID())

    viewer = graphene.Field('Viewer')
    transaction = graphene.Field('TransactionNode')
    bucket = graphene.Field('BucketNode')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        transaction = instance_for_node_id(input.get('transaction_id'), info)
        bucket = instance_for_node_id(input.get('bucket_id'), info)

        bucket.filters.append({'description_exact': transaction.description})
        bucket.save()

        return Cls(viewer=Viewer(), bucket=bucket, transaction=transaction)


class TransactionsMutations(graphene.ObjectType):
    detect_transfers = graphene.Field(DetectTransfersMutation)
    set_income_from_savings = graphene.Field(SetIncomeFromSavingsMutation)
    transaction_quick_add = graphene.Field(TransactionQuickAddMutation)

    class Meta:
        abstract = True
