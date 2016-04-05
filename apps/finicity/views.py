
import json

from django.views.generic import TemplateView
from django.http import HttpResponseRedirect

from .client import Finicity
from .models import FinicityInstitution


class AddInstitutionView(TemplateView):
    template_name = 'finicity/add-institution.html'

    def get_context_data(self, *args, **kwargs):
        context = super(AddInstitutionView, self).get_context_data(*args, **kwargs)

        query = self.request.GET.get('query')

        if not query:
            return context

        client = Finicity(self.request.user)

        context['institutions'] = client.list_institutions(query)
        for i in context['institutions']:
            i['raw'] = json.dumps(i, indent=2)

        return context

    def post(self, *args, **kwargs):
        client = Finicity(self.request.user)
        fi_data = client.get_institution(self.request.POST.get('id'))

        FinicityInstitution.objects.create(
            name=fi_data['name'],
            url=fi_data['urlHomeApp'],
            finicity_id=fi_data['id'],
        )

        return HttpResponseRedirect(self.request.META.get('HTTP_REFERER'))

add_institution_view = AddInstitutionView.as_view()
