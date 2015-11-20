# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('institutions', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, auto_created=True, verbose_name='ID')),
                ('plaid_id', models.CharField(max_length=255)),
                ('type', models.CharField(max_length=255)),
                ('subtype', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('number_snippet', models.CharField(max_length=255)),
                ('balance_current', models.DecimalField(max_digits=12, decimal_places=2)),
                ('balance_available', models.DecimalField(max_digits=12, decimal_places=2)),
                ('last_updated', models.DateTimeField()),
                ('institution', models.ForeignKey(to='institutions.Institution', related_name='accounts')),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
