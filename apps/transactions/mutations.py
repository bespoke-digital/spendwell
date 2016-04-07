
import graphene
from graphene.relay import ClientIDMutation

from apps.core.types import Month, Money
from apps.core.utils import instance_for_node_id, unique
from apps.buckets.models import Bucket

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
        bucket_name = graphene.InputField(graphene.String())

    viewer = graphene.Field('Viewer')
    transaction = graphene.Field('TransactionNode')
    bucket = graphene.Field('BucketNode')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        transaction = instance_for_node_id(input.get('transaction_id'), info)
        filter = {'description_exact': transaction.description}

        if input.get('bucket_id'):
            bucket = instance_for_node_id(input['bucket_id'], info)
            bucket.filters = unique(bucket.filters + [filter])
            bucket.save()

        elif input.get('bucket_name'):
            bucket = Bucket.objects.create(
                owner=info.request_context.user,
                name=input['bucket_name'],
                filters=[filter],
            )

        return Cls(viewer=Viewer(), bucket=bucket, transaction=transaction)


class TransactionsMutations(graphene.ObjectType):
    detect_transfers = graphene.Field(DetectTransfersMutation)
    set_income_from_savings = graphene.Field(SetIncomeFromSavingsMutation)
    transaction_quick_add = graphene.Field(TransactionQuickAddMutation)

    class Meta:
        abstract = True
