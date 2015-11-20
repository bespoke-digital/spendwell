
from rest_framework import viewsets

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = super(CategoryViewSet, self).get_queryset()

        if 'parent' in self.request.data and self.request.data['parent'] != 'none':
            queryset = queryset.filter(parent_id=self.request.data['parent'])

        elif 'parent' in self.request.data and self.request.data['parent'] == 'none':
            queryset = queryset.filter(parent=None)

        return queryset
