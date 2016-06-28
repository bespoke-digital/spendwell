
import json
import logging

import graphene
from graphene.utils import with_context
from django.utils import timezone

from apps.institutions.models import Institution
from apps.accounts.models import Account

from .client import Finicity, FinicityError, FinicityMFAException, FinicityValidation


logger = logging.getLogger(__name__)


class ConnectFinicityInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        finicity_id = graphene.InputField(graphene.String())
        credentials = graphene.InputField(graphene.String())
        mfa_answers = graphene.InputField(graphene.String())
        sync = graphene.InputField(graphene.Boolean())

    viewer = graphene.Field('Viewer')

    @classmethod
    @with_context
    def mutate_and_get_payload(cls, input, context, info):
        from spendwell.schema import Viewer

        institution = None

        try:
            client = Finicity(context.user)

            institution = Institution.objects.from_finicity(
                owner=context.user,
                data=client.get_institution(input['finicity_id']),
            )

            sync_kwargs = {
                'credentials': json.loads(input['credentials']),
            }
            if 'mfa_answers' in input:
                sync_kwargs['mfa_answers'] = json.loads(input['mfa_answers'])

            accounts_data = client.connect_institution(input['finicity_id'], **sync_kwargs)

            for account_data in accounts_data:
                Account.objects.from_finicity(institution, account_data)

            if input.get('sync'):
                institution.sync_transactions()
                institution.last_sync = timezone.now()
                institution.reauth_required = False
                institution.save()

        except FinicityError as e:
            if institution is not None:
                institution.delete()

            if not isinstance(e, (FinicityMFAException, FinicityValidation)):
                logger.exception()

            raise e

        return ConnectFinicityInstitutionMutation(viewer=Viewer())


class FinicityMutations(graphene.ObjectType):
    connect_finicity_institution = graphene.Field(ConnectFinicityInstitutionMutation)

    class Meta:
        abstract = True
