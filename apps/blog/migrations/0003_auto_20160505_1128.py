# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-05 15:28
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0002_auto_20160504_2340'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entry',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='entries', to='blog.Category'),
        ),
    ]
