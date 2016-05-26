
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Bucket, BucketAvatar


class BucketAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')
    search_fields = ('name',)
    readonly_fields = ('owner',)
    fields = (
        'owner',
        'name',
        '_filters',
        'type',
        'avatar',
    )

admin_site.register(Bucket, BucketAdmin)


class BucketAvatarAdmin(admin.ModelAdmin):
    list_display = ('name',)

admin_site.register(BucketAvatar, BucketAvatarAdmin)
