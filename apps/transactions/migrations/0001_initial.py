# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-11 21:14
from __future__ import unicode_literals

from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('categories', '0002_remove_category_deleted'),
        ('buckets', '0003_auto_20160211_1643'),
        ('accounts', '0006_auto_20160210_2121'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BucketTransaction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bucket_month', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='buckets.BucketMonth')),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('description', models.CharField(max_length=255)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('date', models.DateTimeField()),
                ('balance', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('plaid_id', models.CharField(blank=True, max_length=255, null=True)),
                ('pending', models.BooleanField(default=False)),
                ('location', django.contrib.postgres.fields.jsonb.JSONField(null=True)),
                ('source', models.CharField(choices=[('csv', 'CSV'), ('plaid', 'Plaid Connect')], default='plaid', max_length=255)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='accounts.Account')),
                ('bucket_month', models.ManyToManyField(related_name='transactions', through='transactions.BucketTransaction', to='buckets.BucketMonth')),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transactions', to='categories.Category')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to=settings.AUTH_USER_MODEL)),
                ('transfer_pair', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='transactions.Transaction')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='buckettransaction',
            name='transaction',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='transactions.Transaction'),
        ),
    ]
