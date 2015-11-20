
from rest_framework import viewsets

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = super(CategoryViewSet, self).get_queryset()

        if 'parent' in self.request.GET:
            if self.request.GET['parent'] == 'none':
                queryset = queryset.filter(parent=None)

            else:
                queryset = queryset.filter(parent_id=self.request.GET['parent'])

        return queryset
