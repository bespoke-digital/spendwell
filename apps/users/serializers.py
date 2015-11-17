
from rest_framework import serializers

from apps.core.serializers import AsJsonSerializerMixin
from .models import User


class UserSerializer(AsJsonSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('name',)
