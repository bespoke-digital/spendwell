
import graphene
from graphene.relay import ClientIDMutation
from graphene.relay.types import Edge

from apps.core.types import Month, DateTime
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
        filters = filter_list_schema(TransactionFilter, 'BucketFilterSet')

    viewer = graphene.Field('Viewer')
    bucket_edge = graphene.Field(BucketEdge)

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        bucket = Bucket.objects.create(
            owner=info.request_context.user,
            name=input['name'],
            filters=input['filters'],
        )

        BucketMonth.objects.generate(bucket)

        return Cls(
            viewer=Viewer(),
            bucket_edge=BucketEdge(cursor='none', node=bucket),
        )


class GenerateBucketMonthMutation(graphene.relay.ClientIDMutation):
    class Input:
        bucket_id = graphene.ID()
        month = graphene.InputField(Month)

    bucket = graphene.Field(BucketNode)

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        bucket = instance_for_node_id(input['bucket_id'], info)
        BucketMonth.objects.generate(bucket, input['month'])
        return Cls(bucket=bucket)


class BucketsMutations(graphene.ObjectType):
    assign_transactions = graphene.Field(AssignTransactionsMutation)
    create_bucket = graphene.Field(CreateBucketMutation)
    generate_bucket_month = graphene.Field(GenerateBucketMonthMutation)

    class Meta:
        abstract = True
