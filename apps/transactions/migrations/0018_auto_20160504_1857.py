# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-05-04 18:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0017_auto_20160428_1757'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='source',
            field=models.CharField(choices=[('csv', 'CSV'), ('plaid', 'Plaid'), ('finicity', 'Finicity'), ('demo', 'Demo Data')], max_length=255),
        ),
    ]
