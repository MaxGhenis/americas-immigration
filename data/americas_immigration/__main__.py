"""Entry point: fetch Census data and write public/data.json."""

import os

from americas_immigration.census import fetch_census_data, compute_regions
from americas_immigration.output import write_data_json


def main() -> None:
    print("Fetching ACS 2024 B05006 data from Census API...")
    raw = fetch_census_data()
    print(f"  Total foreign-born: {raw['B05006_001E']:,}")

    print("Computing regions and shares...")
    data = compute_regions(raw)
    print(f"  {len(data['regions'])} regions computed")
    print(f"  Americas total share: {data['americas_total_share']}%")

    # Output path: repo_root/public/data.json
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    output_path = os.path.join(repo_root, "public", "data.json")

    print(f"Writing {output_path}...")
    write_data_json(data, output_path)
    print("Done.")


if __name__ == "__main__":
    main()
