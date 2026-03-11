"""
Iteration 10 - Duration Tiers and Flagship Programs Test
Tests the P0 simplification refactor features:
1. All 6 programs are flagship with 3 duration tiers each
2. GET /api/programs returns programs with is_flagship=true and duration_tiers
3. GET /api/programs?visible_only=true&upcoming_only=true returns upcoming programs
4. Annual tier with price=0 should trigger 'Contact for Pricing' in frontend
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProgramsAPI:
    """Test Programs API with duration tiers"""
    
    def test_get_all_programs(self):
        """GET /api/programs returns all 6 programs"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        programs = response.json()
        assert len(programs) == 6, f"Expected 6 programs, got {len(programs)}"
        print(f"✓ Found {len(programs)} programs")
    
    def test_all_programs_are_flagship(self):
        """All 6 programs should have is_flagship=True"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        flagship_count = sum(1 for p in programs if p.get('is_flagship') == True)
        assert flagship_count == 6, f"Expected 6 flagship programs, got {flagship_count}"
        print(f"✓ All {flagship_count} programs are marked as Flagship")
    
    def test_all_programs_have_3_tiers(self):
        """All flagship programs should have exactly 3 duration tiers"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            tiers = p.get('duration_tiers', [])
            assert len(tiers) == 3, f"Program {p.get('id')} has {len(tiers)} tiers, expected 3"
            print(f"✓ Program {p.get('id')}: {p.get('title')[:30]}... has {len(tiers)} tiers")
    
    def test_tier_labels(self):
        """Each program should have 1 Month, 3 Months, and Annual tiers"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            tiers = p.get('duration_tiers', [])
            labels = [t.get('label') for t in tiers]
            
            # Check for expected tier labels
            assert any('1 Month' in l or '1 month' in l.lower() for l in labels), f"Missing '1 Month' tier in program {p.get('id')}"
            assert any('3 Month' in l or '3 month' in l.lower() for l in labels), f"Missing '3 Months' tier in program {p.get('id')}"
            assert any('Annual' in l or 'annual' in l.lower() or 'Year' in l for l in labels), f"Missing 'Annual' tier in program {p.get('id')}"
        
        print("✓ All programs have 1 Month, 3 Months, and Annual tiers")
    
    def test_annual_tier_has_zero_price(self):
        """Annual tier should have price_aed=0 to trigger 'Contact for Pricing'"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            tiers = p.get('duration_tiers', [])
            annual_tier = None
            for t in tiers:
                label = t.get('label', '').lower()
                if 'annual' in label or 'year' in label:
                    annual_tier = t
                    break
            
            assert annual_tier is not None, f"No Annual tier found in program {p.get('id')}"
            assert annual_tier.get('price_aed', -1) == 0, f"Annual tier should have price_aed=0, got {annual_tier.get('price_aed')}"
            assert annual_tier.get('price_inr', -1) == 0, f"Annual tier should have price_inr=0, got {annual_tier.get('price_inr')}"
            assert annual_tier.get('price_usd', -1) == 0, f"Annual tier should have price_usd=0, got {annual_tier.get('price_usd')}"
        
        print("✓ All programs have Annual tier with price=0 (triggers 'Contact for Pricing')")
    
    def test_get_upcoming_programs(self):
        """GET /api/programs?visible_only=true&upcoming_only=true returns only upcoming programs"""
        response = requests.get(f"{BASE_URL}/api/programs?visible_only=true&upcoming_only=true")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        programs = response.json()
        assert len(programs) == 3, f"Expected 3 upcoming programs, got {len(programs)}"
        
        # Verify all returned programs have is_upcoming=True
        for p in programs:
            assert p.get('is_upcoming') == True, f"Program {p.get('id')} should be upcoming"
        
        print(f"✓ Found {len(programs)} upcoming programs")
    
    def test_get_single_program_with_tiers(self):
        """GET /api/programs/1 returns program with duration_tiers"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        program = response.json()
        
        # Verify structure
        assert program.get('is_flagship') == True, "Program should be flagship"
        assert 'duration_tiers' in program, "Program should have duration_tiers"
        assert len(program.get('duration_tiers', [])) == 3, f"Expected 3 tiers, got {len(program.get('duration_tiers', []))}"
        
        # Verify tier structure
        for tier in program.get('duration_tiers', []):
            assert 'label' in tier, "Tier should have label"
            assert 'price_aed' in tier, "Tier should have price_aed"
            assert 'price_inr' in tier, "Tier should have price_inr"
            assert 'price_usd' in tier, "Tier should have price_usd"
        
        print(f"✓ Program {program.get('id')}: {program.get('title')} has valid tier structure")
    
    def test_tier_pricing_values(self):
        """Verify tier pricing values are correct for program 1"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        
        program = response.json()
        tiers = program.get('duration_tiers', [])
        
        # Expected values for AWRP
        expected = {
            '1 Month': {'aed': 729, 'inr': 14999, 'usd': 199},
            '3 Months': {'aed': 1899, 'inr': 39999, 'usd': 499},
            'Annual': {'aed': 0, 'inr': 0, 'usd': 0}
        }
        
        for tier in tiers:
            label = tier.get('label')
            if label in expected:
                exp = expected[label]
                assert tier.get('price_aed') == exp['aed'], f"{label} AED mismatch"
                assert tier.get('price_inr') == exp['inr'], f"{label} INR mismatch"
                assert tier.get('price_usd') == exp['usd'], f"{label} USD mismatch"
                print(f"✓ {label}: AED {tier.get('price_aed')}, INR {tier.get('price_inr')}, USD {tier.get('price_usd')}")


class TestVisibleOnlyFilter:
    """Test visible_only filter"""
    
    def test_visible_only_returns_visible_programs(self):
        """GET /api/programs?visible_only=true returns only visible programs"""
        response = requests.get(f"{BASE_URL}/api/programs?visible_only=true")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            assert p.get('visible') != False, f"Program {p.get('id')} should be visible"
        
        print(f"✓ All {len(programs)} programs in visible_only query are visible")


class TestProgramFields:
    """Test program fields"""
    
    def test_program_has_required_fields(self):
        """Programs should have all required fields"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        
        program = response.json()
        
        required_fields = ['id', 'title', 'description', 'is_flagship', 'duration_tiers']
        for field in required_fields:
            assert field in program, f"Missing required field: {field}"
        
        print("✓ Program has all required fields")
    
    def test_program_has_session_mode(self):
        """Programs should have session_mode field"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        
        program = response.json()
        assert 'session_mode' in program, "Program should have session_mode"
        assert program.get('session_mode') in ['online', 'remote', 'both', None], f"Invalid session_mode: {program.get('session_mode')}"
        
        print(f"✓ Program has session_mode: {program.get('session_mode')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
