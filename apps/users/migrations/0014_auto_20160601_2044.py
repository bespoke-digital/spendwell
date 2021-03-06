# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-06-01 20:44
from __future__ import unicode_literals
import csv
import os

from delorean import parse
from django.db import migrations


csv_path = os.path.join(
    os.path.dirname(__file__),
    '0014_auto_20160601_2044.csv',
)


def import_beta_signups(apps, schema_editor):
    BetaSignup = apps.get_model('users', 'BetaSignup')

    with open(csv_path, 'r') as csvfile:
        for row in csv.reader(csvfile):
            BetaSignup.objects.get_or_create(email=row[0], defaults={'created': parse(row[1]).datetime})


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0013_auto_20160601_2002'),
    ]

    operations = [
        migrations.RunPython(import_beta_signups),
    ]
