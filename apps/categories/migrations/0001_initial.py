# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, auto_created=True, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('plaid_id', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(max_length=255)),
                ('parent', models.ForeignKey(to='categories.Category', related_name='children')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
