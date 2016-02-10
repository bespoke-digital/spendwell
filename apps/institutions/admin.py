
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Institution


class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')

admin_site.register(Institution, InstitutionAdmin)
