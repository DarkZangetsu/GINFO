# Generated by Django 5.2 on 2025-04-22 12:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_info', '0004_remove_notification_statut'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='statut',
            field=models.BooleanField(null=True),
        ),
    ]
