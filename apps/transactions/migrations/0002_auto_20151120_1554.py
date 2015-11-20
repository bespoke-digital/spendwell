# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='address_city',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='address_state',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='address_street',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
