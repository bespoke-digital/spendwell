
import graphene
from graphene.relay.types import Edge
from django.conf import settings

from plaid import Client

from apps.core.utils import get_cursor, instance_for_node_id
from .models import Institution
from .schema import InstitutionNode


InstitutionEdge = Edge.for_node(InstitutionNode)


class CreateInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        name = graphene.String()

    viewer = graphene.Field('Viewer')
    institution_edge = graphene.Field(InstitutionEdge)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        institution = Institution.objects.create(
            owner=info.request_context.user,
            name=input['name'],
        )

        return CreateInstitutionMutation(
            viewer=Viewer(),
            institution_edge=InstitutionEdge(
                cursor=get_cursor(institution),
                node=institution
            ),
        )


class ConnectInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        public_token = graphene.String()
        institution_plaid_id = graphene.String()

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        plaid_client = Client(
            client_id=settings.PLAID_CLIENT_ID,
            secret=settings.PLAID_SECRET,
        )

        token_response = plaid_client.exchange_token(input['public_token']).json()
        institution_response = plaid_client.institution(input['institution_plaid_id']).json()

        institution, created = Institution.objects.get_or_create(
            owner=info.request_context.user,
            plaid_id=input['institution_plaid_id'],
            defaults={'name': institution_response['name']},
        )
        institution.access_token = token_response['access_token']
        institution.save()
        institution.sync_accounts()
        return ConnectInstitutionMutation(viewer=Viewer())


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

        for institution in info.request_context.user.institutions.filter(plaid_id__isnull=False):
            institution.sync()

        info.request_context.user.estimate_income()
        info.request_context.user.save()

        return SyncInstitutionsMutation(viewer=Viewer())


class InstitutionsMutations(graphene.ObjectType):
    create_institution = graphene.Field(CreateInstitutionMutation)
    connect_institution = graphene.Field(ConnectInstitutionMutation)
    sync_institution = graphene.Field(SyncInstitutionMutation)
    sync_institutions = graphene.Field(SyncInstitutionsMutation)

    class Meta:
        abstract = True
