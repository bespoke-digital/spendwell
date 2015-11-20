
from django.contrib.admin import AdminSite


class MBAdminSite(AdminSite):
    site_header = 'Moneybase Admin'
    site_title = 'Moneybase'
    site_url = 'https://dev.moneybase.co'
    index_title = 'Admin Home'

admin_site = MBAdminSite(name='admin')
