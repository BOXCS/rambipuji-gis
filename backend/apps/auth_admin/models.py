from django.contrib.auth.models import AbstractUser
from django.db import models


class AdminUser(AbstractUser):
    """Custom user model for Rambipuji WebGIS admin panel.

    Extends AbstractUser to add a role field distinguishing superadmin
    (full access including user management) from operator (potensi CRUD only).

    No business logic belongs here — keep this as a pure data definition.
    """

    ROLE_SUPERADMIN = "superadmin"
    ROLE_OPERATOR = "operator"

    ROLE_CHOICES = [
        (ROLE_SUPERADMIN, "Superadmin"),
        (ROLE_OPERATOR, "Operator"),
    ]

    role = models.CharField(
        "Peran",
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_OPERATOR,
    )

    class Meta:
        db_table = "auth_admin_user"
        verbose_name = "Admin User"
        verbose_name_plural = "Admin Users"

    def __str__(self) -> str:
        return f"{self.username} ({self.get_role_display()})"
