
from rest_framework import serializers

from apps.core.serializers import MBOwnedSerializerMixin
from .models import Bucket


class BucketSerializer(MBOwnedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Bucket
        fields = (
            'id',
            'name',
            'monthly_amount',
            'autofill',
        )
