# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-28 17:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0016_auto_20160414_1817'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='source',
            field=models.CharField(choices=[('csv', 'CSV'), ('plaid', 'Plaid'), ('finicity', 'Finicity'), ('demo', 'Demo Data')], default='plaid', max_length=255),
        ),
    ]
