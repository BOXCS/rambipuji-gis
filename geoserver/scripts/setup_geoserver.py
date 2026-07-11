#!/usr/bin/env python3
"""
Idempotent setup script for GeoServer workspaces, PostGIS datastore, feature types, and SLD styles.
Runs inside the backend container to configure GeoServer via REST API.
"""

from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

# Load environment defaults
GEOSERVER_URL = os.getenv("INTERNAL_GEOSERVER_URL", "http://geoserver:8080/geoserver").rstrip("/")
ADMIN_USER = os.getenv("GEOSERVER_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("GEOSERVER_ADMIN_PASSWORD", "geoserver")
WORKSPACE = os.getenv("GEOSERVER_WORKSPACE", "rambipuji")

PG_HOST = os.getenv("POSTGRES_HOST", "postgres")
PG_PORT = os.getenv("POSTGRES_PORT", "5432")
PG_DB = os.getenv("POSTGRES_DB", "rambipuji_gis")
PG_USER = os.getenv("POSTGRES_USER", "rambipuji_user")
PG_PASSWORD = os.getenv("POSTGRES_PASSWORD", "rambipuji_secret_password")

LAYERS_CONFIG = [
    {
        "layer_name": "batas_wilayah",
        "title": "Batas Wilayah Desa Rambipuji",
        "style_name": "batas_wilayah",
        "sld_file": "batas_wilayah.sld",
    },
    {
        "layer_name": "potensi_pertanian",
        "title": "Potensi Pertanian",
        "style_name": "pertanian",
        "sld_file": "pertanian.sld",
    },
    {
        "layer_name": "potensi_umkm",
        "title": "UMKM & Usaha Warga",
        "style_name": "umkm",
        "sld_file": "umkm.sld",
    },
    {
        "layer_name": "potensi_wisata",
        "title": "Wisata & Budaya",
        "style_name": "wisata",
        "sld_file": "wisata.sld",
    },
    {
        "layer_name": "potensi_infrastruktur",
        "title": "Infrastruktur & Fasilitas",
        "style_name": "infrastruktur",
        "sld_file": "infrastruktur.sld",
    },
]


def get_auth_header() -> str:
    creds = f"{ADMIN_USER}:{ADMIN_PASSWORD}"
    b64 = base64.b64encode(creds.encode("utf-8")).decode("utf-8")
    return f"Basic {b64}"


def rest_request(
    endpoint: str,
    method: str = "GET",
    data: bytes | None = None,
    content_type: str = "application/json",
    accept: str = "*/*",
) -> tuple[int, bytes]:
    url = f"{GEOSERVER_URL}/rest/{endpoint.lstrip('/')}"
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", get_auth_header())
    req.add_header("Accept", accept)
    if data is not None:
        req.add_header("Content-Type", content_type)

    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read()
    except Exception as exc:
        print(f"ERROR: Failed connecting to GeoServer ({url}): {exc}")
        sys.exit(1)


def setup_workspace() -> None:
    print(f"[1/5] Checking workspace '{WORKSPACE}'...")
    status, _ = rest_request(f"workspaces/{WORKSPACE}.json")
    if status == 200:
        print(f"      Workspace '{WORKSPACE}' already exists.")
        return

    print(f"      Creating workspace '{WORKSPACE}'...")
    payload = json.dumps({"workspace": {"name": WORKSPACE}}).encode("utf-8")
    status, body = rest_request("workspaces", method="POST", data=payload)
    if status not in (200, 201):
        print(f"ERROR: Failed to create workspace '{WORKSPACE}' (HTTP {status}): {body.decode()}")
        sys.exit(1)
    print(f"      Successfully created workspace '{WORKSPACE}'.")


def setup_datastore() -> None:
    ds_name = "rambipuji_postgis"
    print(f"[2/5] Checking datastore '{ds_name}'...")
    status, _ = rest_request(f"workspaces/{WORKSPACE}/datastores/{ds_name}.json")
    if status == 200:
        print(f"      Datastore '{ds_name}' already exists.")
        return

    print(f"      Creating PostGIS datastore '{ds_name}'...")
    payload = json.dumps(
        {
            "dataStore": {
                "name": ds_name,
                "connectionParameters": {
                    "entry": [
                        {"@key": "host", "$": PG_HOST},
                        {"@key": "port", "$": PG_PORT},
                        {"@key": "database", "$": PG_DB},
                        {"@key": "user", "$": PG_USER},
                        {"@key": "passwd", "$": PG_PASSWORD},
                        {"@key": "dbtype", "$": "postgis"},
                        {"@key": "schema", "$": "public"},
                    ]
                },
            }
        }
    ).encode("utf-8")

    status, body = rest_request(
        f"workspaces/{WORKSPACE}/datastores",
        method="POST",
        data=payload,
    )
    if status not in (200, 201):
        print(f"ERROR: Failed to create datastore '{ds_name}' (HTTP {status}): {body.decode()}")
        sys.exit(1)
    print(f"      Successfully created datastore '{ds_name}'.")


def setup_styles() -> None:
    print("[3/5] Uploading and configuring SLD styles...")
    styles_dir = Path("/geoserver/styles")
    if not styles_dir.exists():
        styles_dir = Path("geoserver/styles")

    for cfg in LAYERS_CONFIG:
        style_name = cfg["style_name"]
        sld_filename = cfg["sld_file"]
        sld_file = styles_dir / sld_filename
        if not sld_file.exists():
            print(f"ERROR: SLD file missing: {sld_file}")
            sys.exit(1)

        sld_content = sld_file.read_bytes()
        status, _ = rest_request(f"styles/{style_name}.json")
        if status == 200:
            print(f"      Style '{style_name}' already registered.")
        else:
            print(f"      Registering style '{style_name}'...")
            payload = json.dumps({
                "style": {
                    "name": style_name,
                    "filename": sld_filename,
                }
            }).encode("utf-8")
            s, body = rest_request("styles", method="POST", data=payload)
            if s not in (200, 201):
                print(f"ERROR: Failed to register style '{style_name}' (HTTP {s}): {body.decode()}")
                sys.exit(1)
            print(f"      Style '{style_name}' registered successfully.")

        # Update style content via PUT
        s, body = rest_request(
            f"styles/{style_name}",
            method="PUT",
            data=sld_content,
            content_type="application/vnd.ogc.sld+xml",
        )
        if s not in (200, 201):
            print(f"ERROR: Failed updating SLD content for style '{style_name}' (HTTP {s}): {body.decode()}")
            sys.exit(1)
        print(f"      SLD content for '{style_name}' updated successfully.")


def setup_featuretypes() -> None:
    ds_name = "rambipuji_postgis"
    print("[4/5] Publishing spatial layers (featuretypes)...")
    for cfg in LAYERS_CONFIG:
        layer_name = cfg["layer_name"]
        title = cfg["title"]

        status, _ = rest_request(
            f"workspaces/{WORKSPACE}/datastores/{ds_name}/featuretypes/{layer_name}.json"
        )
        if status == 200:
            print(f"      FeatureType '{layer_name}' already published.")
            continue

        print(f"      Publishing layer '{layer_name}' ({title})...")
        payload = json.dumps(
            {
                "featureType": {
                    "name": layer_name,
                    "nativeName": layer_name,
                    "title": title,
                    "srs": "EPSG:4326",
                    "nativeBoundingBox": {
                        "minx": 113.5,
                        "maxx": 113.7,
                        "miny": -8.4,
                        "maxy": -8.1,
                        "crs": "EPSG:4326",
                    },
                    "latLonBoundingBox": {
                        "minx": 113.5,
                        "maxx": 113.7,
                        "miny": -8.4,
                        "maxy": -8.1,
                        "crs": "EPSG:4326",
                    },
                }
            }
        ).encode("utf-8")

        s, body = rest_request(
            f"workspaces/{WORKSPACE}/datastores/{ds_name}/featuretypes",
            method="POST",
            data=payload,
        )
        if s not in (200, 201):
            print(f"ERROR: Failed to publish featureType '{layer_name}' (HTTP {s}): {body.decode()}")
            sys.exit(1)
        print(f"      Successfully published '{layer_name}'.")


def assign_default_styles() -> None:
    print("[5/5] Assigning default SLD styles to layers...")
    for cfg in LAYERS_CONFIG:
        layer_name = cfg["layer_name"]
        style_name = cfg["style_name"]
        print(f"      Setting default style '{style_name}' for layer '{WORKSPACE}:{layer_name}'...")
        payload = json.dumps(
            {
                "layer": {
                    "defaultStyle": {
                        "name": style_name,
                    }
                }
            }
        ).encode("utf-8")

        s, body = rest_request(
            f"layers/{WORKSPACE}:{layer_name}",
            method="PUT",
            data=payload,
        )
        if s not in (200, 201):
            print(f"ERROR: Failed setting default style for '{WORKSPACE}:{layer_name}' (HTTP {s}): {body.decode()}")
            sys.exit(1)
        print(f"      Default style '{style_name}' assigned to '{WORKSPACE}:{layer_name}'.")


def main():
    print("=== GeoServer Idempotent Setup ===")
    setup_workspace()
    setup_datastore()
    setup_styles()
    setup_featuretypes()
    assign_default_styles()
    print("=== GeoServer setup completed successfully! ===")


if __name__ == "__main__":
    main()
