"""
GeoServer integration service for cache management.

Called by admin_views.py after every successful data mutation
(create / update / delete) to clear stale WMS tiles from
GeoWebCache so new markers appear on the map immediately.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# Map Django kategori slugs to GeoServer layer names
_KATEGORI_TO_LAYER: dict[str, str] = {
    "pertanian": "potensi_pertanian",
    "umkm": "potensi_umkm",
    "wisata": "potensi_wisata",
    "infrastruktur": "potensi_infrastruktur",
}

_WORKSPACE = os.environ.get("GEOSERVER_WORKSPACE", "rambipuji")


def _geoserver_auth() -> tuple[str, str]:
    """Return (username, password) from environment."""
    return (
        os.environ.get("GEOSERVER_ADMIN_USER", "admin"),
        os.environ.get("GEOSERVER_ADMIN_PASSWORD", "geoserver"),
    )


def _geoserver_url() -> str:
    """Return the internal GeoServer base URL (no trailing slash)."""
    return os.environ.get(
        "INTERNAL_GEOSERVER_URL", "http://geoserver:8080/geoserver"
    ).rstrip("/")


def clear_layer_cache(kategori: str) -> bool:
    """
    Clear GeoWebCache tiles for the potensi layer that corresponds
    to *kategori* (e.g. ``"umkm"`` → ``rambipuji:potensi_umkm``).

    This is called after every successful admin create / update / delete
    so that WMS tiles served to Leaflet are immediately up-to-date.

    The operation is **fire-and-forget**: if GeoServer is unreachable
    or returns an error, a warning is logged but the caller's HTTP
    response is still returned successfully — data persistence is
    never blocked by a GWC failure.

    Returns
    -------
    bool
        ``True`` if the cache was cleared successfully, ``False`` otherwise.
    """
    layer_name = _KATEGORI_TO_LAYER.get(kategori)
    if not layer_name:
        logger.debug("clear_layer_cache: unknown kategori '%s', skipping.", kategori)
        return False

    qualified = f"{_WORKSPACE}:{layer_name}"
    url = f"{_geoserver_url()}/gwc/rest/masstruncate"
    payload = f"<truncateLayer><layerName>{qualified}</layerName></truncateLayer>"

    try:
        resp = requests.post(
            url,
            data=payload,
            headers={"Content-Type": "application/xml"},
            auth=_geoserver_auth(),
            timeout=5,
        )
        if resp.status_code in (200, 201):
            logger.info("GWC cache cleared for layer '%s'.", qualified)
            return True

        logger.warning(
            "GWC masstruncate returned HTTP %s for layer '%s': %s",
            resp.status_code,
            qualified,
            resp.text[:200],
        )
        return False

    except Exception as exc:  # noqa: BLE001
        # Non-fatal — log and continue; never raise from here
        logger.warning(
            "Failed to clear GWC cache for layer '%s': %s",
            qualified,
            exc,
        )
        return False
