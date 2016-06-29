
from celery import chord

from spendwell.mixpanel import mixpanel
from apps.users.models import User

from .tasks import sync_institution, post_user_sync


def sync_user(user, backoff=0, **kwargs):
    if user.institutions.count() == 0:
        return

    mixpanel.track(user.id, 'sync: start')

    return chord(
        sync_institution.si(id).set(countdown=backoff * 60 * 2)
        for id in user.institutions.values_list('id', flat=True)
    )(
        post_user_sync.s(user.id, backoff=backoff, **kwargs)
    )


def sync_all(**kwargs):
    for user in User.objects.all():
        sync_user(user, **kwargs)
