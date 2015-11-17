
from django.conf import settings

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from plaid import Client

from apps.core.viewsets import MBOwnedViewSetMixin

from .models import Institution
from .serializers import InstitutionSerializer


plaid_client = Client(
    client_id=settings.PLAID_CLIENT_ID,
    secret=settings.PLAID_SECRET,
)


class InstitutionViewSet(MBOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

    def create(self, request):
        response = plaid_client.exchange_token(request.data.public_token)


        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
