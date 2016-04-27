
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Goal, GoalMonth


class GoalAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')
    readonly_fields = ('owner',)
    fields = (
        'owner',
        'name',
    )

admin_site.register(Goal, GoalAdmin)


class GoalMonthAdmin(admin.ModelAdmin):
    list_display = ('goal', 'month_start')
    readonly_fields = ('goal',)
    fields = (
        'owner',
        'goal',
        'month_start',
    )

admin_site.register(GoalMonth, GoalMonthAdmin)
