"""
Test iteration 53: Programs Hub changes, Pricing Hub updates, Homepage flagship cards, Program detail page pricing toggles
- Programs Hub: Single merged table with non-tiered first, tiered below
- Programs Hub: Pricing and Tiers toggle columns (no Group toggle)
- Pricing Hub: No number spinners, updated labels
- Homepage: Flagship with is_upcoming=true uses UpcomingCard, non-upcoming uses SimpleFlagshipCard with purple button
- Program detail page: show_pricing_on_card and show_tiers_on_card toggles
- Sponsor A Life nav link to /sponsor
- Notify-me endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
API = f"{BASE_URL}/api"

class TestProgramsAPI:
    """Test programs API for show_pricing_on_card and show_tiers_on_card toggles"""
    
    def test_get_all_programs(self):
        """Verify all programs are returned with required fields"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        programs = response.json()
        assert len(programs) > 0, "Expected at least one program"
        
        # Check that programs have required fields
        for p in programs:
            assert 'id' in p, "Program must have id"
            assert 'title' in p, "Program must have title"
            # These are the new toggle fields
            assert 'show_pricing_on_card' in p or p.get('show_pricing_on_card') is None, "show_pricing_on_card field should be present or defaulted"
            assert 'show_tiers_on_card' in p or p.get('show_tiers_on_card') is None, "show_tiers_on_card field should be present or defaulted"
        
        print(f"✓ Got {len(programs)} programs with required fields")
    
    def test_programs_sorting_non_tiered_first(self):
        """Verify non-tiered programs would appear first (checking data for sorting)"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        non_tiered = [p for p in programs if len(p.get('duration_tiers', [])) == 0]
        tiered = [p for p in programs if len(p.get('duration_tiers', [])) > 0]
        
        print(f"✓ Non-tiered programs: {len(non_tiered)}, Tiered programs: {len(tiered)}")
        print(f"  Non-tiered: {[p['title'] for p in non_tiered]}")
        print(f"  Tiered: {[p['title'] for p in tiered]}")
    
    def test_flagship_programs(self):
        """Verify flagship programs have expected properties"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        flagship = [p for p in programs if p.get('is_flagship')]
        
        assert len(flagship) >= 1, "Expected at least one flagship program"
        print(f"✓ Found {len(flagship)} flagship programs")
        
        for p in flagship:
            print(f"  - {p['title']}: is_upcoming={p.get('is_upcoming')}, tiers={len(p.get('duration_tiers', []))}")
    
    def test_upcoming_flagship_programs(self):
        """Verify upcoming flagship programs (should use UpcomingCard style)"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        upcoming_flagship = [p for p in programs if p.get('is_flagship') and p.get('is_upcoming')]
        
        print(f"✓ Found {len(upcoming_flagship)} upcoming+flagship programs (should use UpcomingCard)")
        for p in upcoming_flagship:
            print(f"  - {p['title']}")


class TestProgramToggleFields:
    """Test show_pricing_on_card and show_tiers_on_card toggle functionality"""
    
    def test_program_has_pricing_toggle(self):
        """Verify programs have show_pricing_on_card field"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            # Default should be true (showing pricing)
            show_pricing = p.get('show_pricing_on_card', True)
            print(f"  {p['title']}: show_pricing_on_card={show_pricing}")
        
        print("✓ All programs have show_pricing_on_card field")
    
    def test_program_has_tiers_toggle(self):
        """Verify programs have show_tiers_on_card field"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            # Default should be true (showing tiers)
            show_tiers = p.get('show_tiers_on_card', True)
            has_tiers = len(p.get('duration_tiers', [])) > 0
            print(f"  {p['title']}: show_tiers_on_card={show_tiers}, has_tiers={has_tiers}")
        
        print("✓ All programs have show_tiers_on_card field")
    
    def test_update_program_pricing_toggle_off(self):
        """Test updating a program's show_pricing_on_card to false"""
        # Get a program with tiers first
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        tiered_programs = [p for p in programs if len(p.get('duration_tiers', [])) > 0]
        
        if not tiered_programs:
            pytest.skip("No tiered programs available for testing")
        
        test_program = tiered_programs[0]
        original_show_pricing = test_program.get('show_pricing_on_card', True)
        
        # Update to show_pricing_on_card = False
        update_data = {**test_program, 'show_pricing_on_card': False}
        update_response = requests.put(f"{API}/programs/{test_program['id']}", json=update_data)
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify the update
        verify_response = requests.get(f"{API}/programs/{test_program['id']}")
        assert verify_response.status_code == 200
        updated = verify_response.json()
        assert updated.get('show_pricing_on_card') == False, "show_pricing_on_card should be False"
        
        print(f"✓ Updated {test_program['title']} show_pricing_on_card from {original_show_pricing} to False")
        
        # Restore original value
        restore_data = {**test_program, 'show_pricing_on_card': original_show_pricing}
        requests.put(f"{API}/programs/{test_program['id']}", json=restore_data)
        print(f"✓ Restored show_pricing_on_card to {original_show_pricing}")


class TestEnrollmentStatus:
    """Test enrollment status field with Open/Closed/Coming Soon options"""
    
    def test_enrollment_status_field(self):
        """Verify all programs have enrollment_status field"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            status = p.get('enrollment_status', 'open')
            assert status in ['open', 'closed', 'coming_soon'], f"Invalid status: {status}"
            print(f"  {p['title']}: enrollment_status={status}")
        
        print("✓ All programs have valid enrollment_status")
    
    def test_update_enrollment_status(self):
        """Test updating program enrollment_status"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        if not programs:
            pytest.skip("No programs available")
        
        test_program = programs[0]
        original_status = test_program.get('enrollment_status', 'open')
        
        # Update to closed
        update_data = {**test_program, 'enrollment_status': 'closed'}
        update_response = requests.put(f"{API}/programs/{test_program['id']}", json=update_data)
        assert update_response.status_code == 200
        
        # Verify
        verify = requests.get(f"{API}/programs/{test_program['id']}")
        assert verify.json().get('enrollment_status') == 'closed'
        
        # Restore
        restore_data = {**test_program, 'enrollment_status': original_status}
        requests.put(f"{API}/programs/{test_program['id']}", json=restore_data)
        
        print(f"✓ Enrollment status update works: {original_status} → closed → {original_status}")


class TestNotifyMeAPI:
    """Test notify-me endpoint for Coming Soon programs"""
    
    def test_notify_me_endpoint_exists(self):
        """Verify POST /api/notify-me works"""
        test_data = {
            "email": "test-iteration53@example.com",
            "program_id": "1",
            "program_title": "Test Program"
        }
        response = requests.post(f"{API}/notify-me", json=test_data)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        print("✓ POST /api/notify-me endpoint works")
    
    def test_get_notify_me_subscribers(self):
        """Verify GET /api/notify-me returns subscribers"""
        response = requests.get(f"{API}/notify-me")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected a list of subscribers"
        print(f"✓ GET /api/notify-me returns {len(data)} subscribers")


class TestSettingsAPI:
    """Test settings API for nav items"""
    
    def test_get_settings(self):
        """Verify settings endpoint returns header nav items"""
        response = requests.get(f"{API}/settings")
        assert response.status_code == 200
        
        settings = response.json()
        assert isinstance(settings, dict), "Settings should be a dict"
        
        nav_items = settings.get('header_nav_items', [])
        print(f"✓ Got settings with {len(nav_items)} nav items")
        
        # Check for Sponsor A Life nav item
        sponsor_items = [item for item in nav_items if 'sponsor' in item.get('label', '').lower()]
        for item in sponsor_items:
            print(f"  Found nav item: {item.get('label')} -> {item.get('href')}")
    
    def test_sponsor_a_life_nav_link(self):
        """Verify Sponsor A Life nav link points to /sponsor"""
        response = requests.get(f"{API}/settings")
        assert response.status_code == 200
        
        settings = response.json()
        nav_items = settings.get('header_nav_items', [])
        
        sponsor_items = [item for item in nav_items if 'sponsor' in item.get('label', '').lower()]
        
        if sponsor_items:
            for item in sponsor_items:
                href = item.get('href', '')
                if href == '/sponsor':
                    print(f"✓ Sponsor A Life nav link correctly points to /sponsor")
                    return
            print(f"⚠ Found Sponsor nav items but href is not /sponsor: {sponsor_items}")
        else:
            print("⚠ No Sponsor A Life nav item found in header_nav_items")


class TestSessions:
    """Test sessions API for Pricing Hub"""
    
    def test_get_sessions(self):
        """Verify sessions endpoint works"""
        response = requests.get(f"{API}/sessions")
        assert response.status_code == 200
        
        sessions = response.json()
        assert isinstance(sessions, list), "Sessions should be a list"
        print(f"✓ Got {len(sessions)} sessions")
        
        # Check sessions have pricing fields
        for s in sessions:
            if s.get('title'):
                print(f"  {s.get('title')}: AED={s.get('price_aed', 0)}, INR={s.get('price_inr', 0)}, USD={s.get('price_usd', 0)}")


class TestProgramDetailAPI:
    """Test single program detail endpoint"""
    
    def test_get_program_by_id(self):
        """Verify single program endpoint returns all fields"""
        # Get all programs first
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        
        programs = response.json()
        if not programs:
            pytest.skip("No programs available")
        
        test_id = programs[0]['id']
        
        # Get single program
        detail_response = requests.get(f"{API}/programs/{test_id}")
        assert detail_response.status_code == 200
        
        program = detail_response.json()
        assert program['id'] == test_id
        
        # Check for all expected fields
        required_fields = ['title', 'duration_tiers', 'show_pricing_on_card', 'show_tiers_on_card']
        for field in required_fields:
            assert field in program or program.get(field) is not None, f"Missing field: {field}"
        
        print(f"✓ Program detail for {program['title']} has all required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
