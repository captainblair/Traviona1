from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('public', 'Public'), ('talent', 'Talent'), ('recruiter', 'Recruiter'), ('content_editor', 'Content Editor'), ('admin', 'Admin')], default='public', max_length=30),
        ),
    ]
