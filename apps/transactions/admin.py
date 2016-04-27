
from django.contrib import admin

from spendwell.admin import admin_site

from .models import Transaction


class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'date', 'account', 'owner')
    search_fields = ('description',)
    readonly_fields = ('owner', 'account')
    fields = (
        'owner',
        'account',
        'category',
        'description',
        'date',
        'plaid_id',
        'from_savings',
        'pending',
        'location',
        'source',
    )

admin_site.register(Transaction, TransactionAdmin)
