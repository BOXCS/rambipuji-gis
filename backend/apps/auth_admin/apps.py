from django.apps import AppConfig


class AuthAdminConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.auth_admin"
    verbose_name = "Admin Authentication"
