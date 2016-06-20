
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from html2text import html2text


def send_email(subject, to, template, context=None, from_email=settings.DEFAULT_FROM_EMAIL):
    if isinstance(to, str):
        to = [to]

    if context is None:
        context = {}

    context['subject'] = subject
    context['SITE_DOMAIN'] = settings.SITE_DOMAIN

    html_message = render_to_string(template, context)

    send_mail(
        subject=subject,
        message=html2text(html_message),
        from_email=from_email,
        recipient_list=to,
        html_message=html_message,
    )
