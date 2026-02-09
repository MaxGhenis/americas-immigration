"""Write the computed data to a JSON file for the frontend."""

import json
import os


def write_data_json(data: dict, output_path: str) -> None:
    """Write data dict to a JSON file at the given path.

    Creates parent directories if they don't exist.
    Formats with 2-space indentation for readability.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
