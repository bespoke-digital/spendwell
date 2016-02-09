
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Goal, GoalMonth


class GoalAdmin(admin.ModelAdmin):
    pass

admin_site.register(Goal, GoalAdmin)
admin_site.register(GoalMonth)
