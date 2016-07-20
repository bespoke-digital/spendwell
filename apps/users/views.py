
from django.core.urlresolvers import reverse
from django.core.signing import Signer
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.shortcuts import redirect
from django.views.generic import CreateView, View
from django.views.generic.edit import FormView
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login

from apps.core.views import EmailView

from .models import User, BetaSignup, AuthToken
from .forms import SignupForm, AuthTokenForm, BetaSignupGeneratorForm
from .email import weekly_email_context
from .utils import unsubscribe_verify


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

        return redirect('{}?signup'.format(
            self.request.GET.get('next', reverse('onboarding'))
        ))

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


def beta_signup_view(request):
    if not request.method == 'POST':
        return HttpResponse(status=405)

    if 'email' not in request.POST:
        return HttpResponse('{ errors: [{ "email": "this field is required" }] }', status=400)

    try:
        validate_email(request.POST['email'])
    except ValidationError:
        return HttpResponse('{ errors: [{ "email": "invalid" }] }', status=400)

    BetaSignup.objects.get_or_create(email=request.POST['email'])

    return HttpResponse()


class BetaSignupGeneratorView(FormView):
    template_name = 'users/beta-signup-generator.html'
    form_class = BetaSignupGeneratorForm

    def form_valid(self, form):
        beta_sigup = BetaSignup.objects.create(email=form.cleaned_data['email'])

        if 'invite' in form.cleaned_data and form.cleaned_data['invite']:
            beta_sigup.invite_user(email=True)

        return super(BetaSignupGeneratorView, self).form_valid(form)

    def get_success_url(self):
        return reverse('beta-signup-generator')

beta_signup_generator_view = BetaSignupGeneratorView.as_view()


class AuthTokenView(FormView):
    template_name = 'base.html'
    form_class = AuthTokenForm

    def get(self, reqwurst):
        return HttpResponse(status_code=405)

    def form_invalid(self, form):
        return JsonResponse(form.errors, status=400)

    def form_valid(self, form):
        auth_token = AuthToken.generate(
            user=form.get_user(),
            device_type=form.cleaned_data['device_type'],
            device_name=form.cleaned_data['device_name'],
        )
        return JsonResponse({'token': auth_token.token})

token_auth_view = AuthTokenView.as_view()


class WeeklyEmailView(EmailView):
    email_template = 'users/email/weekly.html'

    def get_context_data(self):
        return weekly_email_context(self.request.user)

weekly_email_view = WeeklyEmailView.as_view()


class Unsubscribe(View):
    def get(self, request, user_id, signature):
        user = get_object_or_404(User, id=user_id)

        if not unsubscribe_verify(signature, user):
            raise Http404

        user.email_subscribed = False
        user.save()

        return HttpResponse('You have been unsubscribed from all emails.')

unsubscribe_view = Unsubscribe.as_view()
