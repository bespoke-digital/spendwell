
import json

import graphene
from graphene.utils import with_context
from django.utils import timezone

from apps.core.utils import instance_for_node_id
from apps.institutions.models import Institution
from apps.accounts.models import Account

from .client import Finicity, FinicityError

try:
    from raven.contrib.django.raven_compat.models import client as raven
except ImportError:
    raven = None


class ConnectFinicityInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        credentials = graphene.InputField(graphene.String())
        institution_template_id = graphene.InputField(graphene.ID())
        mfa_answers = graphene.InputField(graphene.String())
        full_sync = graphene.Boolean()

    viewer = graphene.Field('Viewer')

    @classmethod
    @with_context
    def mutate_and_get_payload(cls, input, context, info):
        from spendwell.schema import Viewer

        try:
            institution_template = instance_for_node_id(
                input['institution_template_id'],
                context,
                info,
                check_owner=False,
            )
            finicity_client = Finicity(context.user)

            institution = Institution.objects.from_finicity(
                owner=context.user,
                data=finicity_client.get_institution(institution_template.finicity_id),
            )

            sync_kwargs = {
                'credentials': json.loads(input['credentials']),
            }
            if 'mfa_answers' in input:
                sync_kwargs['mfa_answers'] = json.loads(input['mfa_answers'])

            accounts_data = finicity_client.connect_institution(
                institution_template.finicity_id,
                **sync_kwargs
            )

            for account_data in accounts_data:
                Account.objects.from_finicity(institution, account_data)

            if 'full_sync' in input and input['full_sync']:
                institution.sync_transactions()
                institution.last_sync = timezone.now()
                institution.reauth_required = False
                institution.save()

        except FinicityError as e:
            if raven:
                raven.captureException()
            raise e

        return ConnectFinicityInstitutionMutation(viewer=Viewer())


class FinicityMutations(graphene.ObjectType):
    connect_finicity_institution = graphene.Field(ConnectFinicityInstitutionMutation)

    class Meta:
        abstract = True
