# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-05-04 18:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_user_estimated_income_confirmed'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='create_bill_help',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='create_goal_help',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='create_label_help',
            field=models.BooleanField(default=True),
        ),
    ]
