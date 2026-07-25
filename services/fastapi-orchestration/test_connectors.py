import pytest
from fastapi import HTTPException

from orgs import get_source_mapping


def test_meridian_has_no_mappings_yet():
    assert get_source_mapping('meridian', 'hubspot') == {'companyId': None}
    assert get_source_mapping('meridian', 'neo4j') == {'nodeId': None}
    assert get_source_mapping('meridian', 'azureSearch') == {'entityId': None}


def test_smartworld_azure_search_is_mapped():
    assert get_source_mapping('smartworld', 'azureSearch') == {'entityId': 'organization:smartworld-developers'}
    assert get_source_mapping('smartworld', 'hubspot') == {'companyId': None}


def test_unregistered_org_raises_404():
    with pytest.raises(HTTPException) as exc_info:
        get_source_mapping('does-not-exist', 'hubspot')
    assert exc_info.value.status_code == 404


def test_organization_sources_route_reflects_mapping_state():
    from app import organization_sources

    meridian = organization_sources('meridian')
    assert meridian['hubspot'].status == 'unmapped'
    assert meridian['neo4j'].status == 'unmapped'
    assert meridian['azureSearch'].status == 'unmapped'

    smartworld = organization_sources('smartworld')
    assert smartworld['hubspot'].status == 'unmapped'
    assert smartworld['azureSearch'].status in ('unavailable', 'live')
    assert smartworld['azureSearch'].externalId == 'organization:smartworld-developers'
