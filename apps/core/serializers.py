
from rest_framework import renderers
from rest_framework import serializers


def serializer_as_json(serializer):
    return renderers.JSONRenderer().render(serializer.data).decode('utf-8')


class MBListSerializer(serializers.ListSerializer):
    def as_json(self):
        return serializer_as_json(self)


class AsJsonSerializerMixin(object):
    def as_json(self):
        return serializer_as_json(self)

    def __new__(cls, *args, **kwargs):
        if kwargs.pop('many', False):
            kwargs['child'] = cls()
            return MBListSerializer(*args, **kwargs)
        return super(AsJsonSerializerMixin, cls).__new__(cls, *args, **kwargs)


class MBSerializerMixin(AsJsonSerializerMixin):
    created = serializers.ReadOnlyField()
    modified = serializers.ReadOnlyField()
    deleted = serializers.ReadOnlyField()


class MBOwnedSerializerMixin(MBSerializerMixin, AsJsonSerializerMixin):
    owner = serializers.ReadOnlyField()

    def create(self, validated_data):
        validated_data['owner_id'] = self.context['request'].user.id
        return super(MBOwnedSerializerMixin, self).create(validated_data)
