# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-03-30 20:41
from __future__ import unicode_literals

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_user_finicity_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='betacode',
            name='created',
            field=models.DateTimeField(auto_now_add=True, default=datetime.datetime(2016, 3, 30, 20, 41, 29, 127031, tzinfo=utc)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='betacode',
            name='modified',
            field=models.DateTimeField(auto_now=True, default=datetime.datetime(2016, 3, 30, 20, 41, 35, 123155, tzinfo=utc)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='betacode',
            name='used',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
