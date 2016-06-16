
from celery import shared_task, chain

from apps.transactions.tasks import detect_transfers
from apps.buckets.tasks import assign_bucket_transactions, autodetect_bills as autodetect_bills_task
from apps.users.tasks import estimate_income as estimate_income_task, set_last_sync
from apps.users.models import User


@shared_task
def sync_institution(institution_id):
    from .models import Institution

    institution = Institution.objects.get(id=institution_id)
    institution.sync()

    return sum(account.transactions.count() for account in institution.accounts.all()) > 0


@shared_task
def post_user_sync(sync_status, user_id, estimate_income=False, autodetect_bills=False, backoff=0):
    from .utils import sync_user

    user = User.objects.get(id=user_id)

    if not all(sync_status):
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

    chain_tasks.append(set_last_sync.si(user.id))

    return chain(chain_tasks).delay()
