"""Fetch ACS 2024 1-Year B05006 data from the Census API."""

import requests

# Census variables from table B05006 (Place of Birth of the Foreign-Born Population)
VARIABLES = [
    "B05006_001E",  # Total foreign-born
    "B05006_002E",  # Europe
    "B05006_047E",  # Asia
    "B05006_079E",  # Western Asia
    "B05006_095E",  # Africa
    "B05006_110E",  # Northern Africa
    "B05006_130E",  # Oceania
    "B05006_138E",  # Americas
    "B05006_140E",  # Caribbean
    "B05006_154E",  # Central America
    "B05006_160E",  # Mexico
    "B05006_164E",  # South America
    "B05006_176E",  # Northern America
    "B05006_177E",  # Canada
]

API_URL = (
    "https://api.census.gov/data/2024/acs/acs1"
    f"?get={','.join(VARIABLES)}"
    "&for=us:1"
)


def fetch_census_data() -> dict[str, int]:
    """Fetch raw variable values from the Census API.

    Returns a dict mapping variable names to integer values.
    """
    response = requests.get(API_URL)
    response.raise_for_status()

    rows = response.json()
    header = rows[0]
    values = rows[1]

    result = {}
    for i, var_name in enumerate(header):
        if var_name in VARIABLES:
            result[var_name] = int(values[i])

    return result


def compute_regions(raw: dict[str, int]) -> dict:
    """Compute derived region categories, counts, and shares.

    Takes the raw dict from fetch_census_data and returns the
    structured data for the frontend JSON.
    """
    total = raw["B05006_001E"]

    # Direct categories
    mexico = raw["B05006_160E"]
    caribbean = raw["B05006_140E"]
    central_america = raw["B05006_154E"]
    south_america = raw["B05006_164E"]
    canada = raw["B05006_177E"]
    europe = raw["B05006_002E"]
    asia = raw["B05006_047E"]
    western_asia = raw["B05006_079E"]
    africa = raw["B05006_095E"]
    n_africa = raw["B05006_110E"]

    # Derived categories
    central_america_ex_mexico = central_america - mexico
    sub_saharan_africa = africa - n_africa
    mena = western_asia + n_africa
    asia_ex_western_asia = asia - western_asia

    def share(value: int) -> float:
        return round(value / total * 100, 1)

    regions = [
        {"region": "Mexico", "count": mexico, "share": share(mexico), "americas": True},
        {"region": "Caribbean", "count": caribbean, "share": share(caribbean), "americas": True},
        {"region": "Central America (ex Mexico)", "count": central_america_ex_mexico, "share": share(central_america_ex_mexico), "americas": True},
        {"region": "South America", "count": south_america, "share": share(south_america), "americas": True},
        {"region": "Canada", "count": canada, "share": share(canada), "americas": True},
        {"region": "Asia (ex Western Asia)", "count": asia_ex_western_asia, "share": share(asia_ex_western_asia), "americas": False},
        {"region": "Europe", "count": europe, "share": share(europe), "americas": False},
        {"region": "Sub-Saharan Africa", "count": sub_saharan_africa, "share": share(sub_saharan_africa), "americas": False},
        {"region": "Middle East / N. Africa", "count": mena, "share": share(mena), "americas": False},
    ]

    americas_total_share = round(
        sum(r["share"] for r in regions if r["americas"]), 1
    )

    return {
        "source": "ACS 2024 1-Year Estimates, Table B05006",
        "source_url": "https://data.census.gov/table/ACSDT1Y2024.B05006",
        "total_foreign_born": total,
        "regions": regions,
        "americas_total_share": americas_total_share,
    }
