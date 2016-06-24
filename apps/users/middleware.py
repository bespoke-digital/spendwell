
from django.http import HttpResponseRedirect

try:
    from raven.contrib.django.raven_compat.models import client as raven
    use_raven = True
except ImportError:
    use_raven = False


class SentryUserContextMiddleware(object):
    def process_request(self, request):
        if use_raven:
            if request.user.is_authenticated():
                raven.user_context({
                    'email': request.user.email,
                    'id': request.user.id,
                })
            else:
                raven.user_context({
                    'email': None,
                    'id': None,
                })


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
