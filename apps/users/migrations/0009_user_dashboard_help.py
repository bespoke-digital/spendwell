# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-08 16:19
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_betacode_intended_for'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='dashboard_help',
            field=models.BooleanField(default=True),
        ),
    ]
