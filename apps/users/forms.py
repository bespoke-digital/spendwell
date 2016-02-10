
from django import forms

from .models import User, BetaCode


class SignupForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput())
    password_confirm = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(),
    )
    beta_code = forms.CharField()

    class Meta:
        model = User
        fields = (
            'email',
            'password',
            'password_confirm',
        )

    def clean_password_confirm(self):
        password = self.cleaned_data.get('password')
        password_confirm = self.cleaned_data.get('password_confirm')

        if password != password_confirm:
            raise forms.ValidationError('Passwords must match.')

        return password_confirm

    def clean_beta_code(self):
        beta_code = self.cleaned_data.get('beta_code')

        try:
            BetaCode.objects.get(key=beta_code, used_by__isnull=True)
        except BetaCode.DoesNotExist:
            raise forms.ValidationError('Invalid beta code.')

        return beta_code

    def save(self):
        user = User.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
        )

        beta_code = BetaCode.objects.get(key=self.cleaned_data['beta_code'])
        beta_code.used_by = user
        beta_code.save()

        return user