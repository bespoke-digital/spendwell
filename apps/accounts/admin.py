
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Account


class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'disabled', 'owner')
    readonly_fields = ('owner',)
    fields = (
        'owner',
        'institution',
        'name',
        'type',
        'subtype',
        'plaid_id',
        'finicity_id',
        'disabled',
    )

admin_site.register(Account, AccountAdmin)
