from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0003_alter_service_options_aboutpage_seo_description_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContactEnquiry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('company', models.CharField(blank=True, max_length=200)),
                ('topic', models.CharField(
                    choices=[
                        ('general', 'General enquiry'),
                        ('advisory', 'Advisory services'),
                        ('careers', 'Careers'),
                        ('talent', 'Talent network'),
                        ('media', 'Media & press'),
                    ],
                    default='general',
                    max_length=30,
                )),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
