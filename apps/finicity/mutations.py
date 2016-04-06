
import json

import graphene

from apps.institutions.models import Institution
from apps.accounts.models import Account

from apps.core.utils import instance_for_node_id
from .client import Finicity


class ConnectFinicityInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        credentials = graphene.InputField(graphene.String())
        finicity_institution_id = graphene.InputField(graphene.ID())
        mfa_answers = graphene.InputField(graphene.String())

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        finicity_institution = instance_for_node_id(input['finicity_institution_id'], info)
        finicity_client = Finicity(info.request_context.user)

        institution = Institution.objects.from_finicity(
            owner=info.request_context.user,
            data=finicity_client.get_institution(finicity_institution.finicity_id),
        )

        sync_kwargs = {
            'credentials': json.loads(input['credentials']),
        }
        if 'mfa_answers' in input:
            sync_kwargs['mfa_answers'] = json.loads(input['mfa_answers'])

        accounts_data = finicity_client.connect_institution(
            finicity_institution.finicity_id,
            **sync_kwargs
        )

        for account_data in accounts_data:
            Account.objects.from_finicity(institution, account_data)

        return ConnectFinicityInstitutionMutation(viewer=Viewer())


class FinicityMutations(graphene.ObjectType):
    connect_finicity_institution = graphene.Field(ConnectFinicityInstitutionMutation)

    class Meta:
        abstract = True
