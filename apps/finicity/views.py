
import json

from django.views.generic import TemplateView
from django.http import HttpResponseRedirect

from .client import Finicity
from .models import FinicityInstitution


class AddInstitutionView(TemplateView):
    template_name = 'finicity/add-institution.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated() or not request.user.is_admin:
            return HttpResponseRedirect('/')
        return super(AddInstitutionView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, *args, **kwargs):
        context = super(AddInstitutionView, self).get_context_data(*args, **kwargs)

        query = self.request.GET.get('query')

        if not query:
            return context

        client = Finicity(self.request.user)

        context['institutions'] = client.list_institutions(query)
        for institution in context['institutions']:
            institution['raw'] = json.dumps(institution, indent=2)
            institution['in_whitelist'] = FinicityInstitution.objects.filter(
                finicity_id=institution['id']
            ).exists()

        return context

    def post(self, *args, **kwargs):
        client = Finicity(self.request.user)
        action = self.request.POST.get('action', 'add')
        finicity_id = self.request.POST.get('id')

        if action == 'remove':
            FinicityInstitution.objects.filter(finicity_id=finicity_id).delete()

        else:
            fi_data = client.get_institution(finicity_id)
            FinicityInstitution.objects.create(
                name=fi_data['name'],
                url=fi_data['urlHomeApp'],
                finicity_id=finicity_id,
            )

        return HttpResponseRedirect(self.request.META.get('HTTP_REFERER'))

add_institution_view = AddInstitutionView.as_view()
