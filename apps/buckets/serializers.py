
from rest_framework import serializers

from apps.core.serializers import SWOwnedSerializerMixin
from .models import Bucket


class BucketSerializer(SWOwnedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Bucket
        fields = (
            'id',
            'name',
            'monthly_amount',
            'autofill',
        )
