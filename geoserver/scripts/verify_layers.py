#!/usr/bin/env python3
"""
Verification script for GeoServer WMS capabilities and GetMap image rendering.
Runs inside Docker container against INTERNAL_GEOSERVER_URL.
"""

from __future__ import annotations

import os
import sys
import urllib.error
import urllib.request

GEOSERVER_URL = os.getenv("INTERNAL_GEOSERVER_URL", "http://geoserver:8080/geoserver").rstrip("/")
WORKSPACE = os.getenv("GEOSERVER_WORKSPACE", "rambipuji")

LAYERS = [
    "batas_wilayah",
    "potensi_pertanian",
    "potensi_umkm",
    "potensi_wisata",
    "potensi_infrastruktur",
]


def check_capabilities() -> tuple[bool, str]:
    url = f"{GEOSERVER_URL}/{WORKSPACE}/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities"
    try:
        with urllib.request.urlopen(url) as resp:
            if resp.status != 200:
                return False, ""
            body = resp.read().decode("utf-8", errors="ignore")
            return True, body
    except Exception as exc:
        print(f"ERROR: GetCapabilities request failed: {exc}")
        return False, ""


def check_getmap(layer_name: str) -> bool:
    full_layer = f"{WORKSPACE}:{layer_name}"
    url = (
        f"{GEOSERVER_URL}/{WORKSPACE}/wms?SERVICE=WMS&REQUEST=GetMap"
        f"&LAYERS={full_layer}&SRS=EPSG:4326&WIDTH=256&HEIGHT=256"
        f"&FORMAT=image/png&BBOX=113.5,-8.4,113.7,-8.1"
    )
    try:
        with urllib.request.urlopen(url) as resp:
            ct = resp.headers.get("Content-Type", "").lower()
            if resp.status == 200 and "image/png" in ct:
                return True
            return False
    except Exception as exc:
        print(f"ERROR: GetMap failed for '{full_layer}': {exc}")
        return False


def main():
    print(f"=== Verifying GeoServer WMS endpoints ({GEOSERVER_URL}) ===")
    cap_ok, cap_xml = check_capabilities()

    results = []
    all_success = True

    for layer in LAYERS:
        full_name = f"{WORKSPACE}:{layer}"
        in_cap = cap_ok and (full_name in cap_xml or f"<Name>{layer}</Name>" in cap_xml)
        getmap_ok = check_getmap(layer)

        cap_icon = "✓" if in_cap else "✗"
        map_icon = "✓" if getmap_ok else "✗"

        results.append((layer, cap_icon, map_icon))
        if not (in_cap and getmap_ok):
            all_success = False

    print("\nLayer                 | Capabilities ✓/✗ | GetMap ✓/✗")
    print("----------------------|------------------|------------")
    for layer, c_icon, m_icon in results:
        print(f"{layer:<21} |        {c_icon}         |     {m_icon}")

    print()
    if all_success:
        print("=== All layers verified successfully! ===")
        sys.exit(0)
    else:
        print("ERROR: One or more layer checks failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
