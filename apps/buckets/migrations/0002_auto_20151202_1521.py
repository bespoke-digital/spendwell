# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('buckets', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='bucket',
            name='autofill',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='bucket',
            name='monthly_amount',
            field=models.DecimalField(max_digits=8, decimal_places=2, default=20),
            preserve_default=False,
        ),
    ]
