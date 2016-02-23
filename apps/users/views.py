
from django.core.urlresolvers import reverse
from django.shortcuts import redirect
from django.views.generic import CreateView
from django.contrib.auth import authenticate, login


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

        return redirect(self.request.GET.get('next', reverse('app')))

signup_view = SignupView.as_view()
