
from spendwell.admin import admin_site
from .models import Entry, Category
from django_markdown.admin import MarkdownModelAdmin


class EntryAdmin(MarkdownModelAdmin):
    list_display = ('title', 'slug', 'created')
    readonly_fields = ('slug',)

admin_site.register(Entry, EntryAdmin)


class CategoryAdmin(MarkdownModelAdmin):
    list_display = ('name', 'slug')
    readonly_fields = ('slug',)

admin_site.register(Category, CategoryAdmin)
