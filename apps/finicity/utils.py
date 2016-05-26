
def maybe_list(obj):
    if isinstance(obj, list):
        return obj
    else:
        return [obj]


def normalize_transaction_description(description):
    if description.startswith('NETFLIX.COM'):
        return 'Netflix'

    return description.title()
