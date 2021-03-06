# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-12 17:32
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('buckets', '0008_auto_20160408_1939'),
        ('transactions', '0013_auto_20160412_1731'),
    ]

    operations = [
        migrations.CreateModel(
            name='BucketTransaction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bucket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='buckets.Bucket')),
                ('transaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='transactions.Transaction')),
            ],
        ),
        migrations.AddField(
            model_name='transaction',
            name='bucket',
            field=models.ManyToManyField(related_name='transactions', through='transactions.BucketTransaction', to='buckets.Bucket'),
        ),
        migrations.AlterUniqueTogether(
            name='buckettransaction',
            unique_together=set([('bucket', 'transaction')]),
        ),
    ]
