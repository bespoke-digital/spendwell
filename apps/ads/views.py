
from django.views.generic import FormView
from django.http import HttpResponse
from tweepy import RateLimitError

from .forms import TwitterDownloadForm


class TwitterDownloadView(FormView):
    form_class = TwitterDownloadForm
    template_name = 'ads/twitter-download.html'

    def form_valid(self, form):
        try:
            return HttpResponse(form.generate_csv(), content_type='text/csv')
        except RateLimitError:
            return HttpResponse('Twitter Rate Limit Exceeded')

twitter_download_view = TwitterDownloadView.as_view()
