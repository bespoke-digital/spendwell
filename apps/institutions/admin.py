
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Institution


class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_secret_id', 'reauth_required')
    readonly_fields = ('owner_secret_id',)
    fields = (
        'owner_secret_id',
        'name',
        'plaid_id',
        'plaid_public_token',
        'finicity_id',
        'last_sync',
        'reauth_required',
    )

admin_site.register(Institution, InstitutionAdmin)
