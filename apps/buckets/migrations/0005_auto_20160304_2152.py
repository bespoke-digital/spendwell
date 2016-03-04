# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-04 21:52
from __future__ import unicode_literals

from django.db import migrations


def update_filters(apps, schema_editor):
    Bucket = apps.get_model('buckets', 'Bucket')
    for bucket in Bucket.objects.all():
        filters = []
        for bucket_filter in bucket.filters:
            filter = {}
            for key, value in bucket_filter.items():
                if key == 'description':
                    key = 'description_contains'
                filter[key] = value
            filters.append(filter)
        bucket.filters = filters
        bucket.save()


class Migration(migrations.Migration):

    dependencies = [
        ('buckets', '0004_bucket_type'),
    ]

    operations = [
        migrations.RunPython(update_filters),
    ]
