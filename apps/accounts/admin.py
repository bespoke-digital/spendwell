
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Account


class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'disabled', 'owner_secret_id')
    readonly_fields = ('owner_secret_id',)
    fields = (
        'owner_secret_id',
        'institution',
        'name',
        'type',
        'subtype',
        'current_balance',
        'available_balance',
        'number_snippet',
        'plaid_id',
        'finicity_id',
        'disabled',
    )

admin_site.register(Account, AccountAdmin)
