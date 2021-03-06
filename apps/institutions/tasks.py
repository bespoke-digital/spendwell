
import logging

from celery import shared_task, chain
from django.conf import settings

from spendwell.mixpanel import mixpanel
from apps.transactions.tasks import detect_transfers
from apps.transactions.models import Transaction
from apps.buckets.tasks import assign_bucket_transactions, autodetect_bills as autodetect_bills_task
from apps.users.tasks import estimate_income as estimate_income_task, user_sync_complete
from apps.users.models import User
from apps.finicity.client import FinicityInvalidAccountError


logger = logging.getLogger(__name__)


@shared_task
def sync_institution(institution_id, reauth_on_fail=False, delete_duplicates=False):
    from .models import Institution

    try:
        institution = Institution.objects.get(id=institution_id)
    except Institution.DoesNotExist:
        return True

    try:
        institution.sync(delete_duplicates=delete_duplicates)
    except FinicityInvalidAccountError:
        institution.reauth_required = True
        institution.save()

        logger.exception('Finicity account missing')

        return True

    success = Transaction.objects.filter(account__institution=institution).count() > 0

    if not success and reauth_on_fail:
        institution.reauth_required = True
        institution.save()

    return success


@shared_task
def post_user_sync(sync_status, user_id, estimate_income=False, autodetect_bills=False, backoff=0):
    from .utils import sync_user

    user = User.objects.get(id=user_id)

    if backoff > settings.SYNC_BACKOFF_MAX:
        logger.error('sync backoff maxed out for user', extra={'user_id': user_id})
        mixpanel.track(user.id, 'sync: failed')
        return
    elif (
        (backoff == settings.SYNC_BACKOFF_MAX and not any(sync_status)) or
        (backoff < settings.SYNC_BACKOFF_MAX and not all(sync_status))
    ):
        mixpanel.track(user.id, 'sync: retry')
        return sync_user(
            user,
            estimate_income=estimate_income,
            autodetect_bills=autodetect_bills,
            backoff=backoff+1,
        )

    chain_tasks = [detect_transfers.si(user.id)]

    if autodetect_bills:
        chain_tasks.append(autodetect_bills_task.si(user.id))

    chain_tasks.append(assign_bucket_transactions.si(user.id))

    if estimate_income:
        chain_tasks.append(estimate_income_task.si(user.id))

    chain_tasks.append(user_sync_complete.si(user.id))

    return chain(chain_tasks).delay()
