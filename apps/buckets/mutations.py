
import graphene
from graphene.relay import ClientIDMutation
from graphene.relay.types import Edge

from apps.core.types import Month
from apps.core.utils import instance_for_node_id
from apps.transactions.utils import filter_list_schema
from apps.transactions.filters import TransactionFilter
from .models import BucketMonth, Bucket
from .schema import BucketNode


BucketEdge = Edge.for_node(BucketNode)


class AssignTransactionsMutation(ClientIDMutation):
    class Input:
        month = graphene.InputField(Month())

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer
        BucketMonth.objects.assign_transactions(
            owner=info.request_context.user,
            month_start=input['month'],
        )
        return Cls(viewer=Viewer())


class CreateBucketMutation(graphene.relay.ClientIDMutation):
    class Input:
        name = graphene.String()
        type = graphene.String()
        filters = filter_list_schema(TransactionFilter, 'BucketFilterSet')

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        Bucket.objects.create(
            owner=info.request_context.user,
            name=input['name'],
            filters=input['filters'],
            type=input['type'],
        )

        return Cls(viewer=Viewer())


class UpdateBucketMutation(graphene.relay.ClientIDMutation):
    class Input:
        bucket_id = graphene.ID()
        name = graphene.String()
        filters = filter_list_schema(TransactionFilter, 'BucketFilterSet')

    bucket = graphene.Field(BucketNode)

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        bucket = instance_for_node_id(input['bucket_id'], info)

        if 'name' in input and input['name']:
            bucket.name = input['name']

        if 'filters' in input and input['filters']:
            bucket.filters = input['filters']

        bucket.save()

        return Cls(bucket=bucket)


class GenerateBucketMonthMutation(graphene.relay.ClientIDMutation):
    class Input:
        bucket_id = graphene.ID()
        month = graphene.InputField(Month)

    bucket = graphene.Field(BucketNode)

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        bucket = instance_for_node_id(input['bucket_id'], info)
        BucketMonth.objects.create(bucket=bucket, month_start=input['month'])
        return Cls(bucket=bucket)


class BucketsMutations(graphene.ObjectType):
    assign_transactions = graphene.Field(AssignTransactionsMutation)
    create_bucket = graphene.Field(CreateBucketMutation)
    generate_bucket_month = graphene.Field(GenerateBucketMonthMutation)

    class Meta:
        abstract = True
