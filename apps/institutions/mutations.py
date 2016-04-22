
import graphene
from graphene.relay.types import Edge
from django.conf import settings

from plaid import Client

from .models import Institution
from .schema import InstitutionNode


InstitutionEdge = Edge.for_node(InstitutionNode)


class ConnectPlaidInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        full_sync = graphene.Boolean()
        public_token = graphene.String()
        plaid_institution_id = graphene.String()

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        plaid_client = Client(
            client_id=settings.PLAID_CLIENT_ID,
            secret=settings.PLAID_SECRET,
        )

        token_response = plaid_client.exchange_token(input['public_token']).json()
        institution_response = plaid_client.institution(input['plaid_institution_id']).json()

        institution = Institution.objects.from_plaid(
            owner=info.request_context.user,
            plaid_id=input['plaid_institution_id'],
            access_token=token_response['access_token'],
            data=institution_response,
        )

        if 'full_sync' in input and input['full_sync']:
            institution.sync()
        else:
            institution.sync_accounts()

        return ConnectPlaidInstitutionMutation(viewer=Viewer())


class SyncInstitutionsMutation(graphene.relay.ClientIDMutation):
    class Input:
        pass

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        info.request_context.user.sync()
        info.request_context.user.estimate_income()
        info.request_context.user.save()

        return SyncInstitutionsMutation(viewer=Viewer())


class InstitutionsMutations(graphene.ObjectType):
    connect_plaid_institution = graphene.Field(ConnectPlaidInstitutionMutation)
    sync_institutions = graphene.Field(SyncInstitutionsMutation)

    class Meta:
        abstract = True
