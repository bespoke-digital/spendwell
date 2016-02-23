
from django.http import HttpResponseRedirect


class BetaCodeMiddleware(object):
    def process_request(self, request):
        if request.method == 'GET' and 'beta-code' in request.GET:
            request.session['beta_code'] = request.GET['beta-code']
            new_get = request.GET.copy()
            del new_get['beta-code']

            next_path = request.path

            if len(new_get):
                next_path += '?{}'.format(new_get.urlencode())

            return HttpResponseRedirect(next_path)
