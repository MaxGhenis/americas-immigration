"""Tests for the JSON output writing logic."""

import json
import os
import tempfile

import pytest

from americas_immigration.output import write_data_json


SAMPLE_DATA = {
    "source": "ACS 2024 1-Year Estimates, Table B05006",
    "source_url": "https://data.census.gov/table/ACSDT1Y2024.B05006",
    "total_foreign_born": 50234841,
    "regions": [
        {"region": "Mexico", "count": 11143711, "share": 22.2, "americas": True},
        {"region": "Caribbean", "count": 5280123, "share": 10.5, "americas": True},
        {
            "region": "Central America (ex Mexico)",
            "count": 4579745,
            "share": 9.1,
            "americas": True,
        },
        {
            "region": "South America",
            "count": 4812345,
            "share": 9.6,
            "americas": True,
        },
        {"region": "Canada", "count": 700000, "share": 1.4, "americas": True},
        {
            "region": "Asia (ex Western Asia)",
            "count": 13000000,
            "share": 25.9,
            "americas": False,
        },
        {"region": "Europe", "count": 4876543, "share": 9.7, "americas": False},
        {
            "region": "Sub-Saharan Africa",
            "count": 2333333,
            "share": 4.6,
            "americas": False,
        },
        {
            "region": "Middle East / N. Africa",
            "count": 1888888,
            "share": 3.8,
            "americas": False,
        },
    ],
    "americas_total_share": 52.8,
}


class TestWriteDataJson:
    """Test the write_data_json function."""

    def test_creates_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            outpath = os.path.join(tmpdir, "data.json")
            write_data_json(SAMPLE_DATA, outpath)
            assert os.path.exists(outpath)

    def test_file_is_valid_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            outpath = os.path.join(tmpdir, "data.json")
            write_data_json(SAMPLE_DATA, outpath)
            with open(outpath) as f:
                data = json.load(f)
            assert isinstance(data, dict)

    def test_output_has_required_keys(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            outpath = os.path.join(tmpdir, "data.json")
            write_data_json(SAMPLE_DATA, outpath)
            with open(outpath) as f:
                data = json.load(f)
            assert "source" in data
            assert "source_url" in data
            assert "total_foreign_born" in data
            assert "regions" in data
            assert "americas_total_share" in data

    def test_output_matches_input(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            outpath = os.path.join(tmpdir, "data.json")
            write_data_json(SAMPLE_DATA, outpath)
            with open(outpath) as f:
                data = json.load(f)
            assert data["total_foreign_born"] == SAMPLE_DATA["total_foreign_born"]
            assert len(data["regions"]) == len(SAMPLE_DATA["regions"])
            assert data["americas_total_share"] == SAMPLE_DATA["americas_total_share"]

    def test_regions_preserve_structure(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            outpath = os.path.join(tmpdir, "data.json")
            write_data_json(SAMPLE_DATA, outpath)
            with open(outpath) as f:
                data = json.load(f)
            for region in data["regions"]:
                assert "region" in region
                assert "count" in region
                assert "share" in region
                assert "americas" in region

    def test_creates_parent_directories(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            outpath = os.path.join(tmpdir, "nested", "dir", "data.json")
            write_data_json(SAMPLE_DATA, outpath)
            assert os.path.exists(outpath)

    def test_json_is_formatted_with_indent(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            outpath = os.path.join(tmpdir, "data.json")
            write_data_json(SAMPLE_DATA, outpath)
            with open(outpath) as f:
                content = f.read()
            # Indented JSON should have newlines and spaces
            assert "\n" in content
            assert "  " in content
