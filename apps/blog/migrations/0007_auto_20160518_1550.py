# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-18 19:50
from __future__ import unicode_literals

from django.db import migrations
import resize.fields


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0006_auto_20160518_1107'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='hero_art',
            field=resize.fields.ResizedImageField(resolutions=('1920x750', '750x500'), upload_to=''),
        ),
    ]
