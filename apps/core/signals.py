
from django.dispatch import Signal

month_start = Signal(providing_args=('month',))
day_start = Signal()
