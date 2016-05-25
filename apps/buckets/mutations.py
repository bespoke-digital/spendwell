
import graphene
from graphene.relay import ClientIDMutation
from graphene.relay.types import Edge
from graphene.utils import to_snake_case

from apps.core.utils import instance_for_node_id
from apps.transactions.utils import filter_list_schema
from apps.transactions.filters import TransactionFilter

from .models import Bucket
from .schema import BucketNode


BucketEdge = Edge.for_node(BucketNode)


def clean_filters(filters):
    return [
        {
            to_snake_case(key): val
            for key, val in filter.items()
            if val is not None and val is not ''
        }
        for filter in filters
    ]


class AssignTransactionsMutation(ClientIDMutation):
    class Input:
        pass

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        for bucket in Bucket.objects.filter(owner=info.request_context.user):
            bucket.assign_transactions()

        return Cls(viewer=Viewer())


class CreateBucketMutation(graphene.relay.ClientIDMutation):
    class Input:
        name = graphene.String()
        type = graphene.String()
        filters = filter_list_schema(TransactionFilter, 'CreateBucketFilterSet')

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        filters = clean_filters(input['filters'])

        filters = clean_filters(input['filters'])
        if not len(filters):
            raise ValueError('filters are required')

        Bucket.objects.create(
            owner=info.request_context.user,
            name=input['name'],
            filters=filters,
            type=input['type'],
        )

        return Cls(viewer=Viewer())


class UpdateBucketMutation(graphene.relay.ClientIDMutation):
    class Input:
        bucket_id = graphene.ID()
        name = graphene.String()
        type = graphene.String()
        filters = filter_list_schema(TransactionFilter, 'UpdateBucketFilterSet')

    viewer = graphene.Field('Viewer')
    bucket = graphene.Field(BucketNode)

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        bucket = instance_for_node_id(input['bucket_id'], info)

        if 'name' in input and input['name']:
            bucket.name = input['name']

        if 'type' in input and input['type']:
            bucket.type = input['type']

        if 'filters' in input and input['filters']:
            bucket.filters = clean_filters(input['filters'])

        bucket.save()

        return Cls(bucket=bucket, viewer=Viewer())


class DeleteBucketMutation(graphene.relay.ClientIDMutation):
    class Input:
        bucket_id = graphene.ID()

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        bucket = instance_for_node_id(input['bucket_id'], info)
        bucket.delete()

        return Cls(viewer=Viewer())


class BucketsMutations(graphene.ObjectType):
    create_bucket = graphene.Field(CreateBucketMutation)
    delete_bucket = graphene.Field(DeleteBucketMutation)
    update_bucket = graphene.Field(UpdateBucketMutation)
    assign_transactions = graphene.Field(AssignTransactionsMutation)

    class Meta:
        abstract = True
