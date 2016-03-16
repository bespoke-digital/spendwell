
from django.contrib import admin

from spendwell.admin import admin_site

from .models import Transaction


class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'date', 'account', 'owner_secret_id')
    search_fields = ('description', 'amount')
    readonly_fields = ('owner_secret_id',)
    fields = (
        'owner_secret_id',
        'account',
        'category',
        'description',
        'amount',
        'date',
        'balance',
        'plaid_id',
        'from_savings',
        'pending',
        'location',
        'source',
    )

admin_site.register(Transaction, TransactionAdmin)
