
from django.core.urlresolvers import reverse
from django.core.signing import Signer
from django.shortcuts import redirect
from django.views.generic import CreateView
from django.contrib.auth import authenticate, login
from django.http import HttpResponse, HttpResponseRedirect

from .models import User
from .forms import SignupForm


class SignupView(CreateView):
    template_name = 'users/signup.html'
    model = User
    context_object_name = 'user'
    form_class = SignupForm

    def get_initial(self):
        return {
            'beta_code': self.request.session.get('beta_code')
        }

    def form_valid(self, form):
        form.save()

        user = authenticate(
            email=self.request.POST['email'],
            password=self.request.POST['password'],
        )
        if user:
            login(self.request, user)

        if 'beta_code' in self.request.session:
            del self.request.session['beta_code']

        return redirect(self.request.GET.get('next', reverse('app')))

signup_view = SignupView.as_view()


def demo_login_view(request, key):
    user = authenticate(demo_key=key)

    if not user:
        return HttpResponse('Invalid Demo Key')

    login(request, user)

    return HttpResponseRedirect(reverse('app'))


def get_demo_key_view(request):
    if not request.user.is_authenticated() or not request.user.is_admin:
        return HttpResponseRedirect('{}?next={}'.format(reverse('login'), request.path))
    else:
        signature = Signer().sign('demo').split(':')[-1]
        return HttpResponse('https://{}{}'.format(
            request.get_host(),
            reverse('demo_login', args=(signature,))
        ))
