
from django.contrib import admin

from spendwell.admin import admin_site
from .models import LoadingQuote


class LoadingQuoteAdmin(admin.ModelAdmin):
    list_display = ('author', 'quote')

admin_site.register(LoadingQuote, LoadingQuoteAdmin)
