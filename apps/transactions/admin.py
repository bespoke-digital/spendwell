
from moneybase.admin import admin_site

from .models import Transaction

admin_site.register(Transaction)
