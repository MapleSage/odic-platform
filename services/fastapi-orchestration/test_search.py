import pytest
from fastapi import HTTPException

from search import local_search


def test_cross_org_search_finds_both_orgs():
    result = local_search('')
    orgs_present = {row['org'] for row in result['results']}
    assert 'meridian' in orgs_present


def test_query_filters_to_matching_person():
    result = local_search('Dana', org_id='meridian')
    assert result['total'] == 1
    assert result['results'][0]['code'] == 'PPL'


def test_facet_filter_is_deterministic():
    result = local_search('', org_id='meridian', facet='RSK')
    assert result['total'] == 3
    assert all(row['code'] == 'RSK' for row in result['results'])


def test_unregistered_org_id_raises_404():
    with pytest.raises(HTTPException) as exc_info:
        local_search('', org_id='does-not-exist')
    assert exc_info.value.status_code == 404
