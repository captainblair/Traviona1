from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('insights', '0006_alter_insight_slugs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='insight',
            name='featured_image_url',
            field=models.URLField(blank=True, max_length=2048),
        ),
        migrations.AlterField(
            model_name='insight',
            name='source_url',
            field=models.URLField(blank=True, max_length=2048),
        ),
    ]
