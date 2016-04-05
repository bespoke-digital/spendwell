
from django.contrib import admin

from spendwell.admin import admin_site
from .models import FinicityInstitution


class FinicityInstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'url')

admin_site.register(FinicityInstitution, FinicityInstitutionAdmin)
