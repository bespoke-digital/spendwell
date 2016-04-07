
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


def unique(s):
    """Return a list of the elements in s, but without duplicates.

    For example, unique([1,2,3,1,2,3]) is some permutation of [1,2,3],
    unique("abcabc") some permutation of ["a", "b", "c"], and
    unique(([1, 2], [2, 3], [1, 2])) some permutation of
    [[2, 3], [1, 2]].

    For best speed, all sequence elements should be hashable.  Then
    unique() will usually work in linear time.

    If not possible, the sequence elements should enjoy a total
    ordering, and if list(s).sort() doesn't raise TypeError it's
    assumed that they do enjoy a total ordering.  Then unique() will
    usually work in O(N*log2(N)) time.

    If that's not possible either, the sequence elements must support
    equality-testing.  Then unique() will usually work in quadratic
    time.
    """

    n = len(s)
    if n == 0:
        return []

    # Try using a dict first, as that's the fastest and will usually
    # work.  If it doesn't work, it will usually fail quickly, so it
    # usually doesn't cost much to *try* it.  It requires that all the
    # sequence elements be hashable, and support equality comparison.
    u = {}
    try:
        for x in s:
            u[x] = 1
    except TypeError:
        del u  # move on to the next method
    else:
        return u.keys()

    # We can't hash all the elements.  Second fastest is to sort,
    # which brings the equal elements together; then duplicates are
    # easy to weed out in a single pass.
    # NOTE:  Python's list.sort() was designed to be efficient in the
    # presence of many duplicate elements.  This isn't true of all
    # sort functions in all languages or libraries, so this approach
    # is more effective in Python than it may be elsewhere.
    try:
        t = list(s)
        t.sort()
    except TypeError:
        del t  # move on to the next method
    else:
        assert n > 0
        last = t[0]
        lasti = i = 1
        while i < n:
            if t[i] != last:
                t[lasti] = last = t[i]
                lasti += 1
            i += 1
        return t[:lasti]

    # Brute force is all that's left.
    u = []
    for x in s:
        if x not in u:
            u.append(x)
    return u
