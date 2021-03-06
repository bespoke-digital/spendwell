
from uuid import uuid4

from django.contrib.gis.geoip2 import GeoIP2
import graphene
from graphene.utils import with_context
from graphene.contrib.django.types import DjangoNode
from graphene.contrib.django.fields import DjangoConnectionField
from ipware.ip import get_real_ip

from apps.core.fields import SWNode, SWFilterConnectionField
from apps.core.types import Money
from apps.accounts.schema import AccountNode
from apps.accounts.filters import AccountFilter
from apps.finicity.schema import FinicityLoginField, resolve_login_form
from apps.finicity.client import Finicity

from .models import Institution, InstitutionTemplate


class InstitutionTemplateNode(DjangoNode):
    login_form = graphene.List(FinicityLoginField)
    image = graphene.String()

    class Meta:
        model = InstitutionTemplate

    @with_context
    @classmethod
    def get_node(Cls, id, context, info=None):
        if id.startswith('finicity-tmp:'):
            finicity_id = id.split(':')[-1]
            client = Finicity(context.user)
            finicity_institution = client.get_institution(finicity_id)
            return InstitutionTemplate(
                    id='finicity-tmp:{}'.format(finicity_institution['id']),
                    finicity_id=finicity_institution['id'],
                    name=finicity_institution['name'],
                    url=finicity_institution['urlHomeApp'],
                )
        else:
            return super(InstitutionTemplateNode, Cls).get_node(id, info)

    @with_context
    def resolve_login_form(self, *args):
        return resolve_login_form(self, *args)

    def resolve_image(self, args, info):
        if self.instance.image:
            return self.instance.image.url


class InstitutionNode(SWNode):
    can_sync = graphene.Field(graphene.Boolean())
    current_balance = graphene.Field(Money)
    accounts = SWFilterConnectionField(AccountNode, filterset_class=AccountFilter)
    institution_template = graphene.Field(InstitutionTemplateNode)
    logo = graphene.Field(graphene.String())

    class Meta:
        model = Institution
        filter_order_by = ('name',)
        filter_fields = ('reauth_required',)
        only_fields = (
            'name',
            'accounts',
            'can_sync',
            'last_sync',
            'current_balance',
            'reauth_required',
            'plaid_id',
            'plaid_public_token',
            'finicity_id',
            'institution_template',
        )

    def resolve_can_sync(self, args, info):
        return bool(self.instance.plaid_id) or bool(self.instance.finicity_id)

    def resolve_logo(self, args, info):
        if self.instance.logo:
            return self.instance.logo.url


class InstitutionsQuery(graphene.ObjectType):
    institution = graphene.relay.NodeField(InstitutionNode)
    institutions = SWFilterConnectionField(InstitutionNode)
    institution_template = graphene.relay.NodeField(InstitutionTemplateNode)
    institution_templates = DjangoConnectionField(InstitutionTemplateNode, query=graphene.String())

    class Meta:
        abstract = True

    @with_context
    def resolve_institution_templates(self, args, context, info):
        if 'query' not in args or not args['query']:
            ip = get_real_ip(context)

            if ip:
                country = GeoIP2().country(ip)['country_code'].lower()
            else:
                country = 'ca'

            return InstitutionTemplate.objects.filter(default=country).order_by('name')

        else:
            institution_templates = list(InstitutionTemplate.objects.filter(
                name__icontains=args['query']
            ).order_by('id'))

            # return unsaved temporary institutions direct from the finicity API.
            client = Finicity(context.user)
            long_tail_institutions = [
                InstitutionTemplate(
                    id='finicity-tmp:{}'.format(fi['id']),
                    finicity_id=fi['id'],
                    name=fi['name'],
                    url=fi['urlHomeApp'],
                )
                for fi in client.list_institutions(args['query'])
            ]

            return institution_templates + long_tail_institutions
