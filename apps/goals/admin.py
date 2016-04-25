
from django.contrib import admin

from spendwell.admin import admin_site
from .models import Goal, GoalMonth


class GoalAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_secret_id')
    readonly_fields = ('owner_secret_id',)
    fields = (
        'owner_secret_id',
        'name',
        'monthly_amount',
    )

admin_site.register(Goal, GoalAdmin)


class GoalMonthAdmin(admin.ModelAdmin):
    list_display = ('goal', 'month_start')

admin_site.register(GoalMonth, GoalMonthAdmin)
