from django.conf import settings


def bootstrap_admin_emails():
    return {email.strip().lower() for email in settings.BOOTSTRAP_ADMIN_EMAILS if email.strip()}


def apply_bootstrap_admin(user):
    """Promote configured owner email(s) to full admin when they use the site."""
    email = (user.email or '').strip().lower()
    if not email or email not in bootstrap_admin_emails():
        return user

    updates = []
    if user.role != 'admin':
        user.role = 'admin'
        updates.append('role')
    if not user.is_staff:
        user.is_staff = True
        updates.append('is_staff')
    if not user.is_superuser:
        user.is_superuser = True
        updates.append('is_superuser')

    if updates:
        user.save(update_fields=updates)
    return user
