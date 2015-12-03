
from django.db.models import Transform
from django.db.models.fields import DateTimeField


@DateTimeField.register_lookup
class HourLessThanEqual(Transform):
    lookup_name = 'hour'
    output_type = models.IntegerField()

    def as_sql(self, compiler, connection):
        lhs, lhs_params = self.process_lhs(compiler, connection)
        return 'extract(hour FROM {})'.format(lhs), lhs_params
