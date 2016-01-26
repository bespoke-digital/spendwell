
from rest_framework import renderers
from rest_framework import serializers


def serializer_as_json(serializer):
    return renderers.JSONRenderer().render(serializer.data).decode('utf-8')


class SWListSerializer(serializers.ListSerializer):
    def as_json(self):
        return serializer_as_json(self)


class AsJsonSerializerMixin(object):
    def as_json(self):
        return serializer_as_json(self)

    def __new__(cls, *args, **kwargs):
        if kwargs.pop('many', False):
            kwargs['child'] = cls()
            return SWListSerializer(*args, **kwargs)
        return super(AsJsonSerializerMixin, cls).__new__(cls, *args, **kwargs)


class SWSerializerMixin(AsJsonSerializerMixin):
    created = serializers.ReadOnlyField()
    modified = serializers.ReadOnlyField()
    deleted = serializers.ReadOnlyField()


class SWOwnedSerializerMixin(SWSerializerMixin, AsJsonSerializerMixin):
    owner = serializers.ReadOnlyField()

    def create(self, validated_data):
        validated_data['owner_id'] = self.context['request'].user.id
        return super(SWOwnedSerializerMixin, self).create(validated_data)
