
def maybe_list(obj):
    if isinstance(obj, list):
        return obj
    else:
        return list(obj)
