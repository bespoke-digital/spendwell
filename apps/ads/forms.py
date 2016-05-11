
import re

from django import forms
from django.conf import settings

import tweepy


class TwitterDownloadForm(forms.Form):
    usernames = forms.CharField(widget=forms.Textarea)

    def clean_usernames(self):
        return [
            username.strip()
            for username in re.split(r'\n|,', self.cleaned_data['usernames'])
        ]

    def generate_csv(self):
        auth = tweepy.OAuthHandler(
            settings.TWITTER_CONSUMER_KEY,
            settings.TWITTER_CONSUMER_SECRET,
        )
        auth.set_access_token(
            settings.TWITTER_ACCESS_TOKEN_KEY,
            settings.TWITTER_ACCESS_TOKEN_SECRET,
        )

        api = tweepy.API(auth)

        followers = []
        for username in self.cleaned_data['usernames']:
            for id in tweepy.Cursor(api.followers_ids, screen_name=username).items():
                followers.append(str(id))

        return '\n'.join(followers)
