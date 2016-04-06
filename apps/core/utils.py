
from decimal import Decimal

import delorean
from dateutil.relativedelta import relativedelta
import graphene
from graphql_relay.node.node import from_global_id
from graphql_relay.connection.arrayconnection import cursor_for_object_in_connection


STUB_SCHEMA = graphene.Schema()


def instance_for_node_id(node_id, info, check_owner=True):
    from spendwell.schema import schema

    resolved_id = from_global_id(node_id)
    object_type = schema.get_type(resolved_id.type)
    node = object_type.get_node(resolved_id.id, info)

    if check_owner and not node.instance.owner == info.request_context.user:
        return None

    return node.instance


def get_cursor(instance):
    # WARNING: this will scale like shit.
    # See https://github.com/graphql-python/graphene/issues/59
    return cursor_for_object_in_connection(
        list(type(instance).objects.owned_by(instance.owner).values_list('id', flat=True)),
        instance.id
    )


def get_core_type(graphene_type):
    "converts a Graphene scalar type into a graphel-core scalar type"
    return STUB_SCHEMA.T(graphene_type)


def this_month():
    return delorean.now().truncate('month').datetime


def months_ago(d1, d2=None):
    if d2 is None:
        d2 = this_month()

    return ((d2.year - d1.year) * 12) + (d2.month - d1.month)


def months_avg(queryset, months=3, month_start=None, date_field='date'):
    if month_start is None:
        month_start = this_month()

    furthest_back = queryset.order_by(date_field).values_list(date_field, flat=True).first()
    if furthest_back is None:
        return 0

    months_ago = relativedelta(month_start, furthest_back).months + 1

    if months_ago <= 0:
        return 0

    if months_ago > months:
        months_ago = months

    total = Decimal(queryset.filter(
        date__gte=month_start - relativedelta(months=months_ago),
        date__lt=month_start,
    ).sum())

    return total / Decimal(months_ago)
