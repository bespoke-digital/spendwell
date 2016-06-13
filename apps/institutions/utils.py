
from celery import chain, group

from apps.transactions.tasks import detect_transfers
from apps.buckets.tasks import assign_bucket_transactions, autodetect_bills as autodetect_bills_task
from apps.users.tasks import estimate_income as estimate_income_task
from apps.users.models import User

from .tasks import sync_institution


def sync_user(owner, estimate_income=False, autodetect_bills=False):
    syncs = group(
        sync_institution.si(id)
        for id in owner.institutions.values_list('id', flat=True)
    )

    chain_tasks = [syncs, detect_transfers.si(owner.id)]

    if autodetect_bills:
        chain_tasks.append(autodetect_bills_task.si(owner.id))

    chain_tasks.append(assign_bucket_transactions.si(owner.id))

    if estimate_income:
        chain_tasks.append(estimate_income_task.si(owner.id))

    return chain(chain_tasks)


def sync_all():
    return group(sync_user(user) for user in User.objects.all())
