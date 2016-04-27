
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Bucket


class BucketAdmin(admin.ModelAdmin):
    list_displat = ('name', 'owner')
    readonly_fields = ('owner',)
    fields = (
        'owner',
        'name',
        'filters',
        'type',
    )

admin_site.register(Bucket, BucketAdmin)
