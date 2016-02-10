
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Goal, GoalMonth


class GoalAdmin(admin.ModelAdmin):
    list_displat = ('name', 'owner')

admin_site.register(Goal, GoalAdmin)


class GoalMonthAdmin(admin.ModelAdmin):
    list_display = ('goal', 'month_start')

admin_site.register(GoalMonth, GoalMonthAdmin)
