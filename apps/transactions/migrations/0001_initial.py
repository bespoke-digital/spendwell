# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, auto_created=True, verbose_name='ID')),
                ('plaid_id', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('amount', models.DecimalField(max_digits=12, decimal_places=2)),
                ('date', models.DateTimeField()),
                ('address_city', models.CharField(max_length=255)),
                ('address_street', models.CharField(max_length=255)),
                ('address_state', models.CharField(max_length=255)),
                ('account', models.ForeignKey(to='accounts.Account', related_name='transactions')),
                ('category', models.ForeignKey(to='categories.Category', related_name='transactions')),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
