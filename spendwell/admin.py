
from django.contrib.admin import AdminSite


class SWAdminSite(AdminSite):
    site_header = 'Spendwell Admin'
    site_title = 'Spendwell'
    site_url = 'https://dev.spendwell.co'
    index_title = 'Spendwell Admin'

admin_site = SWAdminSite(name='admin')
