# Generated by Django 5.2 on 2025-04-24 11:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_info', '0005_notification_statut'),
    ]

    operations = [
        migrations.AddField(
            model_name='information',
            name='email_notification',
            field=models.EmailField(blank=True, help_text='Email où envoyer la notification pour cette information', max_length=255, null=True),
        ),
    ]
