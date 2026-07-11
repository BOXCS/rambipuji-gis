from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "ok", "service": "rambipuji-gis-api"})


urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/auth/", include("apps.auth_admin.urls")),
    path("api/admin/", include("apps.imports.urls")),
    path("api/", include("apps.potensi.urls")),
]


