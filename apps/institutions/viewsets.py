
from django.conf import settings
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from plaid import Client

from apps.core.viewsets import MBOwnedViewSetMixin

from .models import Institution
from .serializers import InstitutionSerializer


class InstitutionViewSet(MBOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

    def create(self, request):
        plaid_client = Client(
            client_id=settings.PLAID_CLIENT_ID,
            secret=settings.PLAID_SECRET,
        )

        token_response = plaid_client.exchange_token(request.data['public_token']).json()
        access_token = token_response['access_token']

        institution_response = plaid_client.institution(request.data['id']).json()
        name = institution_response['name']

        institution = Institution.objects.create(
            access_token=access_token,
            name=name,
            owner=request.user,
            plaid_id=request.data['id'],
        )

        serializer = self.get_serializer(instance=institution)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=self.get_success_headers(serializer.data),
        )
