
import graphene

from apps.core.fields import SWNode, SWConnectionField
from .models import Bucket, BucketMonth


class BucketNode(SWNode):
    class Meta:
        model = Bucket
        only_fields = ('name', 'months')


class BucketMonthNode(SWNode):
    name = graphene.Field(graphene.String())

    class Meta:
        model = BucketMonth
        only_fields = (
            'name',
            'month_start',
            'transactions',
        )

    def resolve_name(self, args, info):
        return self.instance.bucket.name


class BucketsQuery(graphene.ObjectType):
    bucket = graphene.relay.NodeField(BucketNode)
    buckets = SWConnectionField(BucketNode)

    bucket_month = graphene.relay.NodeField(BucketMonthNode)
    bucket_months = SWConnectionField(BucketMonthNode)

    class Meta:
        abstract = True
