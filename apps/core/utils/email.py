
from django.core.mail import send_mail
from django.core.urlresolvers import reverse
from django.template.loader import render_to_string
from django.conf import settings
from html2text import html2text
import premailer

from apps.users.utils import unsubscribe_sign


def send_email(subject, user, template, context=None, from_email=settings.DEFAULT_FROM_EMAIL):
    if isinstance(user, str):
        user = [user]

    html_message, text_message = render_email(subject, user, template, context)

    send_mail(
        subject=subject,
        message=text_message,
        from_email=from_email,
        recipient_list=[user.email],
        html_message=html_message,
    )


def render_email(subject, user, template, context=None):
    if context is None:
        context = {}

    context['subject'] = subject
    context['SITE_DOMAIN'] = settings.SITE_DOMAIN
    context['unsubscribe_url'] = reverse('unsubscribe', kwargs={
        'user_id': user.id,
        'signature': unsubscribe_sign(user),
    })

    html_message = render_to_string(template, context)
    html_message = premailer.transform(
        html_message,
        base_url='https://{}'.format(settings.SITE_DOMAIN),
    )

    text_message = html2text(html_message)

    return html_message, text_message
