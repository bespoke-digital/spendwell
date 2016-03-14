
from django.contrib import admin

from spendwell.admin import admin_site

from .models import Transaction


class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'date', 'account', 'owner')
    search_fields = ('description', 'amount')
    list_filter = ('owner',)

admin_site.register(Transaction, TransactionAdmin)
