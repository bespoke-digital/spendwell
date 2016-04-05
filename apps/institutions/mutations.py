
import graphene
from graphene.relay.types import Edge
from django.conf import settings

from plaid import Client

from apps.core.utils import instance_for_node_id
from .models import Institution
from .schema import InstitutionNode


InstitutionEdge = Edge.for_node(InstitutionNode)


class ConnectPlaidInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
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
        institution.sync_accounts()

        return ConnectPlaidInstitutionMutation(viewer=Viewer())


class SyncInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        institution_id = graphene.String()

    institution = graphene.Field(InstitutionNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        institution = instance_for_node_id(input.get('institution_id'), info)
        institution.sync()
        return SyncInstitutionMutation(institution=institution)


class SyncInstitutionsMutation(graphene.relay.ClientIDMutation):
    class Input:
        pass

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        for institution in info.request_context.user.institutions.all():
            institution.sync()

        info.request_context.user.estimate_income()
        info.request_context.user.save()

        return SyncInstitutionsMutation(viewer=Viewer())


class InstitutionsMutations(graphene.ObjectType):
    connect_plaid_institution = graphene.Field(ConnectPlaidInstitutionMutation)
    sync_institution = graphene.Field(SyncInstitutionMutation)
    sync_institutions = graphene.Field(SyncInstitutionsMutation)

    class Meta:
        abstract = True
