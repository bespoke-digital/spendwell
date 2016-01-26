
from django.contrib.admin import AdminSite


class MBAdminSite(AdminSite):
    site_header = 'SpendWell Admin'
    site_title = 'SpendWell'
    site_url = 'https://dev.spendwell.co'
    index_title = 'SpendWell Admin'

admin_site = MBAdminSite(name='admin')
