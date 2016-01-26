
from rest_framework import serializers

from apps.core.serializers import SWOwnedSerializerMixin
from .models import Institution


class InstitutionSerializer(SWOwnedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ('name', 'id')
