# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-09 20:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('goals', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='goal',
            name='name',
            field=models.CharField(default='not used, probably', max_length=255),
            preserve_default=False,
        ),
    ]
