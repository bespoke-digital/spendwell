
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Account


class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'disabled')

admin_site.register(Account, AccountAdmin)
