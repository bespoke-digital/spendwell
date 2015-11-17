
from rest_framework import serializers

from apps.core.serializers import MBOwnedSerializerMixin
from .models import Institution


class InstitutionSerializer(MBOwnedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ('name',)
