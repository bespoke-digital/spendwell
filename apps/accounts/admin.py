
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Account


class AccountAdmin(admin.ModelAdmin):
    pass

admin_site.register(Account, AccountAdmin)
