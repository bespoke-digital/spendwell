
from celery import chord

from apps.users.models import User

from .tasks import sync_institution, post_user_sync


def sync_user(owner, backoff=0, **kwargs):
    if owner.institutions.count() == 0:
        return

    return chord(
        sync_institution.si(id).set(countdown=backoff * 60 * 2)
        for id in owner.institutions.values_list('id', flat=True)
    )(
        post_user_sync.s(owner.id, backoff=backoff, **kwargs)
    )


def sync_all(**kwargs):
    for user in User.objects.all():
        sync_user(user, **kwargs)
