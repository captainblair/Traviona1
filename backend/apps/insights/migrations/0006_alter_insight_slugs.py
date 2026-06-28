from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('insights', '0005_insight_featured_image_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='insight',
            name='slug',
            field=models.SlugField(blank=True, max_length=250, unique=True),
        ),
        migrations.AlterField(
            model_name='insightcategory',
            name='slug',
            field=models.SlugField(blank=True, max_length=250, unique=True),
        ),
        migrations.AlterField(
            model_name='insighttag',
            name='slug',
            field=models.SlugField(blank=True, max_length=250, unique=True),
        ),
    ]
