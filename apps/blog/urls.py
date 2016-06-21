from django.conf.urls import url

from .views import entry_list_view, entry_detail_view, category_detail_view, tag_detail_view


urlpatterns = [
    url(r'^$', entry_list_view, name='entry_list'),
    url(r'^tag/(?P<slug>[\w-]+)/$', tag_detail_view, name='tag-detail'),
    url(r'^(?P<category_slug>[\w-]+)/(?P<slug>[\w-]+)/$', entry_detail_view, name='entry-detail'),
    url(r'^(?P<slug>[\w-]+)/$', category_detail_view, name='category-detail'),
]
