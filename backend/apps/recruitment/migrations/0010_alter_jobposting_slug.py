from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0009_myjobmag_provider'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobposting',
            name='slug',
            field=models.SlugField(blank=True, max_length=250, unique=True),
        ),
    ]
