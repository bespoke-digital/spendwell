
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Institution, InstitutionTemplate


class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'reauth_required')
    readonly_fields = ('owner',)
    fields = (
        'owner',
        'name',
        'plaid_id',
        'plaid_public_token',
        'finicity_id',
        'last_sync',
        'logo',
        'reauth_required',
    )

admin_site.register(Institution, InstitutionAdmin)


class InstitutionTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'url')

admin_site.register(InstitutionTemplate, InstitutionTemplateAdmin)
