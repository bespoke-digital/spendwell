
from django.core.urlresolvers import reverse
from django.core.signing import Signer
from django.conf import settings


signer = Signer()


def unsubscribe_sign(user):
    return signer.sign('unsubscribe:{}'.format(user.id)).split(':')[-1]


def unsubscribe_verify(signature, user):
    return signature == unsubscribe_sign(user)


def unsubscribe_url(user):
    path = reverse('unsubscribe', kwargs={
        'user_id': user.id,
        'signature': unsubscribe_sign(user),
    })
    url = 'https://{}/{}'.format(settings.SITE_DOMAIN, path)

    return '{}?user={}'.format(url, user.id)
