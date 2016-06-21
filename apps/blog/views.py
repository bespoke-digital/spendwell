from django.views import generic
from .models import Entry, Category
from taggit.models import Tag
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


class EntryListView(generic.ListView):
    queryset = Entry.objects.published().order_by('-featured', '-created')
    template_name = 'blog/entry-list.html'
    context_object_name = 'entries'
    paginate_by = 1

entry_list_view = EntryListView.as_view()


class EntryDetail(generic.DetailView):
    model = Entry
    template_name = 'blog/entry-detail.html'

    def get_context_data(self, **kwargs):
        context = super(EntryDetail, self).get_context_data(**kwargs)
        query = Entry.objects.published().order_by('-created').exclude(id=self.object.id)[:2]
        context['recommend_posts'] = query
        return context

entry_detail_view = EntryDetail.as_view()


class CategoryDetailView(generic.DetailView):
    model = Category
    template_name = 'blog/category-detail.html'

    def get_context_data(self, **kwargs):
        context = super(CategoryDetailView, self).get_context_data(**kwargs)
        entries = self.object.entries.all()
        paginator = Paginator(entries, 4)

        page_num = self.request.GET.get('page')
        try:
            page = paginator.page(page_num)
        except PageNotAnInteger:
            page = paginator.page(1)
        except EmptyPage:
            page = paginator.page(paginator.num_pages)

        context['page_obj'] = page
        context['entries'] = page.object_list
        context['num_pages'] = paginator.num_pages
        return context
category_detail_view = CategoryDetailView.as_view()


class TagDetailView(generic.DetailView):
    model = Tag
    template_name = 'blog/tag-detail.html'

    def get_context_data(self, **kwargs):
        context = super(TagDetailView, self).get_context_data(**kwargs)
        entries = Entry.objects.filter(tags__slug=self.kwargs.get('slug'))
        paginator = Paginator(entries, 2)

        page_num = self.request.GET.get('page')
        try:
            page = paginator.page(page_num)
        except PageNotAnInteger:
            page = paginator.page(1)
        except EmptyPage:
            page = paginator.page(paginator.num_pages)

        context['page_obj'] = page
        context['entries'] = page.object_list
        context['num_pages'] = paginator.num_pages

        return context

tag_detail_view = TagDetailView.as_view()
