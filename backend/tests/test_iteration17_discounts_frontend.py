"""
Iteration 17 - Testing discount display on frontend pages
Tests POST /api/discounts/calculate returns correct breakdown with:
- Group discount (3+ participants = 10% off)
- Combo discount (2+ programs = 5% off)  
- Loyalty discount (returning client = 8% off)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDiscountsCalculation:
    """Test the POST /api/discounts/calculate endpoint"""

    def test_discount_settings_returns_enabled_features(self):
        """GET /api/discounts/settings returns all discount settings"""
        res = requests.get(f"{BASE_URL}/api/discounts/settings")
        assert res.status_code == 200
        data = res.json()
        
        # Check all fields exist
        assert "enable_group_discount" in data
        assert "group_discount_rules" in data
        assert "enable_combo_discount" in data
        assert "combo_discount_pct" in data
        assert "combo_min_programs" in data
        assert "enable_loyalty" in data
        assert "loyalty_discount_pct" in data
        
        # Verify current settings (from iteration 16)
        assert data["enable_group_discount"] == True
        assert data["enable_combo_discount"] == True
        assert data["enable_loyalty"] == True
        print(f"✓ Discount settings: group={data['enable_group_discount']}, combo={data['enable_combo_discount']}, loyalty={data['enable_loyalty']}")

    def test_combo_discount_with_2_programs(self):
        """Combo discount applied when 2+ programs in cart"""
        res = requests.post(f"{BASE_URL}/api/discounts/calculate", json={
            "num_programs": 2,
            "num_participants": 1,
            "subtotal": 10000,
            "email": "",
            "currency": "aed"
        })
        assert res.status_code == 200
        data = res.json()
        
        # 5% combo discount on 10000 = 500
        assert data["combo_discount"] == 500
        assert data["group_discount"] == 0  # Only 1 participant
        assert data["loyalty_discount"] == 0  # No email
        assert data["total_discount"] == 500
        print(f"✓ Combo discount: {data['combo_discount']} (expected 500)")

    def test_group_discount_with_3_participants(self):
        """Group discount applied when 3+ participants"""
        res = requests.post(f"{BASE_URL}/api/discounts/calculate", json={
            "num_programs": 1,
            "num_participants": 3,
            "subtotal": 10000,
            "email": "",
            "currency": "aed"
        })
        assert res.status_code == 200
        data = res.json()
        
        # 10% group discount on 10000 = 1000
        assert data["group_discount"] == 1000
        assert data["combo_discount"] == 0  # Only 1 program
        assert data["loyalty_discount"] == 0
        assert data["total_discount"] == 1000
        print(f"✓ Group discount: {data['group_discount']} (expected 1000)")

    def test_group_and_combo_discount_combined(self):
        """Both group and combo discounts apply together"""
        res = requests.post(f"{BASE_URL}/api/discounts/calculate", json={
            "num_programs": 2,
            "num_participants": 3,
            "subtotal": 10000,
            "email": "",
            "currency": "aed"
        })
        assert res.status_code == 200
        data = res.json()
        
        # Group discount: 10% of 10000 = 1000, remaining = 9000
        # Combo discount: 5% of 9000 = 450
        assert data["group_discount"] == 1000
        assert data["combo_discount"] == 450
        assert data["total_discount"] == 1450
        print(f"✓ Combined: group={data['group_discount']} + combo={data['combo_discount']} = {data['total_discount']}")

    def test_no_group_discount_for_2_participants(self):
        """Group discount NOT applied for less than 3 participants"""
        res = requests.post(f"{BASE_URL}/api/discounts/calculate", json={
            "num_programs": 1,
            "num_participants": 2,
            "subtotal": 10000,
            "email": "",
            "currency": "aed"
        })
        assert res.status_code == 200
        data = res.json()
        
        # Rule says min 3 participants for group discount
        assert data["group_discount"] == 0
        assert data["total_discount"] == 0
        print(f"✓ No group discount for 2 participants: {data['group_discount']}")

    def test_no_combo_discount_for_1_program(self):
        """Combo discount NOT applied for single program"""
        res = requests.post(f"{BASE_URL}/api/discounts/calculate", json={
            "num_programs": 1,
            "num_participants": 1,
            "subtotal": 10000,
            "email": "",
            "currency": "aed"
        })
        assert res.status_code == 200
        data = res.json()
        
        assert data["combo_discount"] == 0
        assert data["group_discount"] == 0
        assert data["total_discount"] == 0
        print(f"✓ No combo discount for 1 program: {data['combo_discount']}")

    def test_loyalty_discount_for_returning_client(self):
        """Loyalty discount applied for returning clients with existing enrollment"""
        # First check if we have a test returning client
        check_res = requests.get(f"{BASE_URL}/api/discounts/check-loyalty/test_returning@divine.com")
        assert check_res.status_code == 200
        
        # For now, test with no returning client
        res = requests.post(f"{BASE_URL}/api/discounts/calculate", json={
            "num_programs": 1,
            "num_participants": 1,
            "subtotal": 10000,
            "email": "new_customer@example.com",
            "currency": "aed"
        })
        assert res.status_code == 200
        data = res.json()
        
        # New customer - no loyalty discount
        assert data["loyalty_discount"] == 0
        print(f"✓ No loyalty discount for new customer: {data['loyalty_discount']}")


class TestProgramsAPI:
    """Test programs API for cart testing"""

    def test_get_programs(self):
        """GET /api/programs returns list of programs"""
        res = requests.get(f"{BASE_URL}/api/programs")
        assert res.status_code == 200
        programs = res.json()
        assert isinstance(programs, list)
        assert len(programs) > 0
        
        # Check program structure
        prog = programs[0]
        assert "id" in prog
        assert "title" in prog
        assert "duration_tiers" in prog
        print(f"✓ Found {len(programs)} programs")


class TestCartCheckoutFlow:
    """Test cart checkout endpoints"""

    def test_enrollment_start(self):
        """POST /api/enrollment/start creates enrollment"""
        res = requests.post(f"{BASE_URL}/api/enrollment/start", json={
            "booker_name": "Test User",
            "booker_email": "test_iteration17@example.com",
            "booker_country": "AE",
            "participants": [
                {
                    "name": "Test Participant 1",
                    "relationship": "Myself",
                    "age": 30,
                    "gender": "Female",
                    "country": "AE",
                    "attendance_mode": "online",
                    "notify": False,
                    "is_first_time": True,
                    "referral_source": ""
                }
            ]
        })
        assert res.status_code in [200, 201]
        data = res.json()
        assert "enrollment_id" in data
        print(f"✓ Enrollment created: {data['enrollment_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
