
from django.core.exceptions import SuspiciousOperation
import graphene
from graphene.contrib.django.utils import get_type_for_model
from graphql_relay import from_global_id, to_global_id
from graphql_relay.connection.arrayconnection import cursor_for_object_in_connection


STUB_SCHEMA = graphene.Schema()


def instance_for_node_id(node_id, context, info, check_owner=True):
    "Returns a model instance for a relay node id"
    from spendwell.schema import schema

    resolved_type, resolved_id = from_global_id(node_id)
    object_type = schema.get_type(resolved_type)
    node = object_type.get_node(resolved_id, context, info)

    if node is None:
        return

    if check_owner and not node.instance.owner == context.user:
        raise SuspiciousOperation('invalid user')

    return node.instance


def node_id_from_instance(instance=None, model=None, id=None):
    "Returns a relay node id for a model instance"
    from spendwell.schema import schema
    schema.schema.get_type_map()

    if instance:
        model = instance.__class__
        id = instance.id
    elif not model or not id:
        raise ValueError('instance or (model and id) must be passed to node_id_from_instance')

    schema_type = get_type_for_model(schema, model)

    if schema_type is None:
        raise ValueError('Cannot find GraphQL type for {}'.format(model))

    return to_global_id(schema_type.__name__, id)


def get_cursor(instance):
    # WARNING: this will scale like shit.
    # See https://github.com/graphql-python/graphene/issues/59
    return cursor_for_object_in_connection(
        list(type(instance).objects.owned_by(instance.owner).values_list('id', flat=True)),
        instance.id
    )


def get_core_type(graphene_type):
    "converts a Graphene scalar type into a graphql-core scalar type"
    return STUB_SCHEMA.T(graphene_type)
