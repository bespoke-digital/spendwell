
from django import forms

from .models import User


class SignupForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput())
    password_confirm = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(),
    )

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

    def save(self):
        return User.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
        )
