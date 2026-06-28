from django.db import migrations


def remove_demo_insight(apps, schema_editor):
    Insight = apps.get_model('insights', 'Insight')
    Insight.objects.filter(
        title='Global strategy briefing',
        author_name='Traviona Desk',
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('insights', '0007_alter_insight_url_lengths'),
    ]

    operations = [
        migrations.RunPython(remove_demo_insight, migrations.RunPython.noop),
    ]
