# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-26 19:27
from __future__ import unicode_literals

from django.db import migrations, models
import resize.fields


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0012_auto_20160526_1111'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='hero_art',
        ),
        migrations.AlterField(
            model_name='entry',
            name='featured',
            field=models.BooleanField(default=False, help_text='Featured articles will always come before non-featured ones'),
        ),
        migrations.AlterField(
            model_name='entry',
            name='hero_art',
            field=resize.fields.ResizedImageField(help_text="Hero Art will be display at these resolutions '1920x700' and '750x500'", resolutions=('1920x700', '750x500'), upload_to=''),
        ),
        migrations.AlterField(
            model_name='entry',
            name='publish',
            field=models.BooleanField(default=False, help_text='Only published Posts will show up on blog'),
        ),
        migrations.AlterField(
            model_name='entry',
            name='title',
            field=models.CharField(help_text='Three lines or less', max_length=200),
        ),
    ]
