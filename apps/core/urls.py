
from django.conf.urls import url
from django.views.generic import TemplateView

from .views import (
    app_view,
    onboarding_view,
    calculators_view,
    manifest_view,
    auth_graphql_view,
    graphiql_view,
    export_demo_data_view,
    import_demo_data_view,
    export_user_data_view,
)


urlpatterns = [
    url(r'^spendwell-data\.zip$', export_user_data_view, name='export-data'),
    url(
        r'^shutting-down$',
        TemplateView.as_view(template_name='shutdown-notice/index.html'),
        name='shutdown-notice',
    ),

    url(r'^admin/export-demo-data$', export_demo_data_view, name='export-demo-data'),
    url(r'^admin/import-demo-data$', import_demo_data_view, name='import-demo-data'),

    url(r'^graphiql', graphiql_view, name='graphiql'),
    url(r'^graphql', auth_graphql_view, name='graphql'),

    url(r'^app', app_view, name='app'),
    url(r'^onboarding', onboarding_view, name='onboarding'),
    url(r'^calculators/debt-repayment-calculator', calculators_view, name='calculators'),

    url(r'^manifest\.json$', manifest_view, name='manifest'),
]
