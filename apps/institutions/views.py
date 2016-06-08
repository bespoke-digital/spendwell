
import json
from base64 import b64decode

from django.core.files.base import ContentFile
from django.utils.text import slugify
from django.views.generic import TemplateView
from django.http import HttpResponseRedirect
import requests

from apps.institutions.models import InstitutionTemplate
from apps.finicity.client import Finicity


class CreateInstitutionTemplateView(TemplateView):
    template_name = 'institutions/create-template.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated() or not request.user.is_admin:
            return HttpResponseRedirect('/')
        return super(CreateInstitutionTemplateView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, *args, **kwargs):
        context = super(CreateInstitutionTemplateView, self).get_context_data(*args, **kwargs)

        query = self.request.GET.get('query', '')
        provider = self.request.GET.get('provider', 'plaid')

        context['query'] = query
        context['provider'] = provider

        if not query:
            return context

        if provider == 'finicity':
            client = Finicity(self.request.user)

            context['institutions'] = client.list_institutions(query)
            for institution in context['institutions']:
                institution['raw'] = json.dumps(institution, indent=2)
                institution['in_whitelist'] = InstitutionTemplate.objects.filter(
                    finicity_id=institution['id']
                ).exists()
        else:
            response = requests.get(
                'https://api.plaid.com/institutions/search?p=connect&q={}'.format(query)
            )
            context['institutions'] = response.json()
            for institution in context['institutions']:
                institution['raw'] = json.dumps(institution, indent=2)
                institution['in_whitelist'] = InstitutionTemplate.objects.filter(
                    plaid_id=institution['id']
                ).exists()

        return context

    def post(self, *args, **kwargs):
        client = Finicity(self.request.user)
        action = self.request.POST.get('action', 'add')
        id = self.request.POST.get('id')
        provider = self.request.POST.get('provider')

        if action == 'remove':
            if provider == 'fincity':
                InstitutionTemplate.objects.filter(finicity_id=id).delete()
            elif provider == 'plaid':
                InstitutionTemplate.objects.filter(plaid_id=id).delete()

        else:
            if provider == 'fincity':
                fi_data = client.get_institution(id)
                InstitutionTemplate.objects.create(
                    finicity_id=id,
                    name=fi_data['name'],
                    url=fi_data['urlHomeApp'],
                )
            elif provider == 'plaid':
                fi_data = requests.get(
                    'https://api.plaid.com/institutions/search?id={}'.format(id)
                ).json()

                if 'logo' in fi_data:
                    image = ContentFile(
                        b64decode(fi_data['logo']),
                        '{}.png'.format(slugify(fi_data['name']))[:90],
                    )
                else:
                    image = None

                InstitutionTemplate.objects.create(
                    plaid_id=id,
                    name=fi_data['name'],
                    url=fi_data['accountSetup'],
                    color=fi_data.get('colors', {}).get('primary'),
                    image=image,
                )

        return HttpResponseRedirect(self.request.META.get('HTTP_REFERER'))

create_institution_template_view = CreateInstitutionTemplateView.as_view()
