
from celery import shared_task


@shared_task
def sync_institution(institution_id):
    from .models import Institution
    Institution.objects.get(id=institution_id).sync()
