# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-06 16:26
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finicity', '0002_finicityinstitution_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='finicityinstitution',
            name='color',
            field=models.CharField(default='000000', max_length=6),
        ),
    ]
