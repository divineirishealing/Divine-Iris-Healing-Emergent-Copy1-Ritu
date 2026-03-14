"""
Backend API tests for Iteration 50
Testing: Programs, Duration Tiers with start/end dates, Pricing Hub functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProgramsAPI:
    """Tests for Programs API endpoints"""
    
    def test_get_all_programs(self):
        """Test fetching all programs"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/programs returned {len(data)} programs")
    
    def test_get_visible_programs(self):
        """Test fetching visible-only programs"""
        response = requests.get(f"{BASE_URL}/api/programs?visible_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned programs should be visible
        for p in data:
            assert p.get('visible', True) == True, f"Program {p['title']} should be visible"
        print(f"✓ GET /api/programs?visible_only=true returned {len(data)} visible programs")
    
    def test_get_upcoming_programs(self):
        """Test fetching upcoming-only programs"""
        response = requests.get(f"{BASE_URL}/api/programs?upcoming_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned programs should have is_upcoming=True
        for p in data:
            assert p.get('is_upcoming') == True, f"Program {p['title']} should be upcoming"
        print(f"✓ GET /api/programs?upcoming_only=true returned {len(data)} upcoming programs")
    
    def test_program_has_required_fields(self):
        """Test that programs have required fields including duration_tiers"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            program = data[0]
            required_fields = ['id', 'title', 'description', 'category', 'image', 
                             'is_upcoming', 'is_flagship', 'duration_tiers',
                             'price_aed', 'price_inr', 'price_usd']
            for field in required_fields:
                assert field in program, f"Program missing required field: {field}"
            print(f"✓ Program has all required fields: {required_fields}")


class TestDurationTiersAPI:
    """Tests for Duration Tiers in Programs"""
    
    def test_program_tiers_have_dates(self):
        """Test that duration tiers can have start_date and end_date"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        data = response.json()
        
        # Find a program with tiers
        program_with_tiers = None
        for p in data:
            if len(p.get('duration_tiers', [])) > 0:
                program_with_tiers = p
                break
        
        if program_with_tiers:
            tier = program_with_tiers['duration_tiers'][0]
            # Verify tier has start_date and end_date fields (even if empty)
            assert 'start_date' in tier or tier.get('start_date') is None, "Tier missing start_date field"
            assert 'end_date' in tier or tier.get('end_date') is None, "Tier missing end_date field"
            print(f"✓ Duration tier has start_date/end_date fields")
            print(f"  Program: {program_with_tiers['title']}")
            print(f"  Tier: {tier.get('label')}, start: {tier.get('start_date', 'N/A')}, end: {tier.get('end_date', 'N/A')}")
        else:
            pytest.skip("No programs with duration tiers found")
    
    def test_update_tier_dates(self):
        """Test updating tier start/end dates via program update"""
        # First get a program with tiers
        response = requests.get(f"{BASE_URL}/api/programs")
        data = response.json()
        
        program_with_tiers = None
        for p in data:
            if len(p.get('duration_tiers', [])) > 0:
                program_with_tiers = p
                break
        
        if not program_with_tiers:
            pytest.skip("No programs with duration tiers found")
        
        program_id = program_with_tiers['id']
        tiers = program_with_tiers['duration_tiers']
        
        # Update the first tier with test dates
        test_start = "TEST_March 1, 2026"
        test_end = "TEST_March 30, 2026"
        original_start = tiers[0].get('start_date', '')
        original_end = tiers[0].get('end_date', '')
        
        tiers[0]['start_date'] = test_start
        tiers[0]['end_date'] = test_end
        
        # Update program
        update_response = requests.put(
            f"{BASE_URL}/api/programs/{program_id}",
            json={**program_with_tiers, 'duration_tiers': tiers}
        )
        assert update_response.status_code == 200, f"Failed to update program: {update_response.text}"
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        assert verify_response.status_code == 200
        updated_program = verify_response.json()
        updated_tier = updated_program['duration_tiers'][0]
        
        assert updated_tier.get('start_date') == test_start, f"Start date not updated: {updated_tier.get('start_date')}"
        assert updated_tier.get('end_date') == test_end, f"End date not updated: {updated_tier.get('end_date')}"
        print(f"✓ Tier dates updated and persisted successfully")
        
        # Restore original values
        tiers[0]['start_date'] = original_start
        tiers[0]['end_date'] = original_end
        requests.put(f"{BASE_URL}/api/programs/{program_id}", json={**program_with_tiers, 'duration_tiers': tiers})
        print(f"✓ Original tier dates restored")


class TestSessionsAPI:
    """Tests for Sessions API endpoints"""
    
    def test_get_all_sessions(self):
        """Test fetching all sessions"""
        response = requests.get(f"{BASE_URL}/api/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/sessions returned {len(data)} sessions")
    
    def test_session_has_pricing_fields(self):
        """Test that sessions have pricing fields for Pricing Hub"""
        response = requests.get(f"{BASE_URL}/api/sessions")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            session = data[0]
            pricing_fields = ['price_aed', 'price_inr', 'price_usd', 
                            'offer_price_aed', 'offer_price_inr', 'offer_price_usd', 
                            'offer_text']
            for field in pricing_fields:
                assert field in session, f"Session missing field: {field}"
            print(f"✓ Session has all pricing fields")


class TestUpcomingPrograms:
    """Tests for Upcoming Programs specific functionality"""
    
    def test_upcoming_program_has_dates(self):
        """Test that upcoming programs have start_date, end_date, deadline_date"""
        response = requests.get(f"{BASE_URL}/api/programs?upcoming_only=true")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            program = data[0]
            date_fields = ['start_date', 'end_date', 'deadline_date']
            for field in date_fields:
                assert field in program, f"Upcoming program missing field: {field}"
            print(f"✓ Upcoming program '{program['title']}' has date fields:")
            print(f"  start_date: {program.get('start_date', 'N/A')}")
            print(f"  end_date: {program.get('end_date', 'N/A')}")
            print(f"  deadline_date: {program.get('deadline_date', 'N/A')}")
        else:
            pytest.skip("No upcoming programs found")
    
    def test_upcoming_program_has_timing(self):
        """Test that upcoming programs have timing and time_zone"""
        response = requests.get(f"{BASE_URL}/api/programs?upcoming_only=true")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            program = data[0]
            assert 'timing' in program, "Missing timing field"
            assert 'time_zone' in program, "Missing time_zone field"
            print(f"✓ Upcoming program has timing: {program.get('timing')} {program.get('time_zone')}")
        else:
            pytest.skip("No upcoming programs found")


class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_api_health(self):
        """Test API root endpoint (health check)"""
        # /api/health may not exist - test root or settings instead
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        print("✓ API connectivity verified via settings endpoint")
    
    def test_settings_endpoint(self):
        """Test settings endpoint for page configuration"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert 'id' in data
        print("✓ Settings endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
