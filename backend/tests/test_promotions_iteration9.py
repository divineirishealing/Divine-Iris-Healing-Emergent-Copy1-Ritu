"""
Test file for Iteration 9 - Promotions System & Program Updates
Tests:
- Promotions CRUD: POST, GET, PUT, DELETE /api/promotions
- Promotions Validation: POST /api/promotions/validate
- Active Promotions Filter: GET /api/promotions/active
- Program new fields: session_mode, end_date, is_flagship, duration_tiers
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestPromotionsCRUD:
    """Tests for Promotions CRUD operations"""
    
    def test_get_promotions(self):
        """GET /api/promotions returns all promotions"""
        response = requests.get(f"{BASE_URL}/api/promotions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"GET /api/promotions: {len(data)} promotions found")
        # Verify structure of promotions
        if len(data) > 0:
            promo = data[0]
            assert "id" in promo
            assert "name" in promo
            assert "type" in promo
            assert "discount_type" in promo
    
    def test_create_promotion_coupon_percentage(self):
        """POST /api/promotions creates a percentage-based coupon"""
        unique_code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        payload = {
            "name": "TEST Percentage Coupon",
            "code": unique_code,
            "type": "coupon",
            "discount_type": "percentage",
            "discount_percentage": 20.0,
            "applicable_to": "all",
            "usage_limit": 50,
            "expiry_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "active": True
        }
        response = requests.post(f"{BASE_URL}/api/promotions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST Percentage Coupon"
        assert data["code"] == unique_code
        assert data["discount_type"] == "percentage"
        assert data["discount_percentage"] == 20.0
        print(f"Created coupon: {data['code']} with {data['discount_percentage']}% off")
        # Cleanup
        requests.delete(f"{BASE_URL}/api/promotions/{data['id']}")
    
    def test_create_promotion_early_bird_fixed(self):
        """POST /api/promotions creates a fixed amount early bird offer"""
        payload = {
            "name": "TEST Early Bird Fixed",
            "code": "",  # Early bird doesn't require code
            "type": "early_bird",
            "discount_type": "fixed",
            "discount_aed": 100.0,
            "discount_inr": 2000.0,
            "discount_usd": 25.0,
            "applicable_to": "all",
            "usage_limit": 0,  # Unlimited
            "active": True
        }
        response = requests.post(f"{BASE_URL}/api/promotions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "early_bird"
        assert data["discount_type"] == "fixed"
        assert data["discount_aed"] == 100.0
        assert data["discount_inr"] == 2000.0
        assert data["discount_usd"] == 25.0
        print(f"Created early_bird: AED {data['discount_aed']} / INR {data['discount_inr']} / USD {data['discount_usd']} off")
        # Cleanup
        requests.delete(f"{BASE_URL}/api/promotions/{data['id']}")
    
    def test_create_promotion_limited_time(self):
        """POST /api/promotions creates a limited time offer"""
        unique_code = f"LTO{uuid.uuid4().hex[:6].upper()}"
        payload = {
            "name": "TEST Limited Time Offer",
            "code": unique_code,
            "type": "limited_time",
            "discount_type": "percentage",
            "discount_percentage": 10.0,
            "applicable_to": "all",
            "start_date": datetime.now().isoformat(),
            "expiry_date": (datetime.now() + timedelta(hours=48)).isoformat(),
            "active": True
        }
        response = requests.post(f"{BASE_URL}/api/promotions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "limited_time"
        assert data["start_date"] != ""
        assert data["expiry_date"] != ""
        print(f"Created limited_time offer: {data['code']} valid from {data['start_date']}")
        # Cleanup
        requests.delete(f"{BASE_URL}/api/promotions/{data['id']}")
    
    def test_create_promotion_specific_programs(self):
        """POST /api/promotions creates a coupon for specific programs"""
        unique_code = f"SPEC{uuid.uuid4().hex[:6].upper()}"
        payload = {
            "name": "TEST Specific Program Coupon",
            "code": unique_code,
            "type": "coupon",
            "discount_type": "percentage",
            "discount_percentage": 15.0,
            "applicable_to": "specific",
            "applicable_program_ids": ["1"],  # AWRP program
            "active": True
        }
        response = requests.post(f"{BASE_URL}/api/promotions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["applicable_to"] == "specific"
        assert "1" in data["applicable_program_ids"]
        print(f"Created program-specific coupon: {data['code']} for program IDs: {data['applicable_program_ids']}")
        # Cleanup
        requests.delete(f"{BASE_URL}/api/promotions/{data['id']}")
    
    def test_update_promotion(self):
        """PUT /api/promotions/{id} updates a promotion"""
        # First create a promotion
        unique_code = f"UPD{uuid.uuid4().hex[:6].upper()}"
        payload = {
            "name": "TEST Update Me",
            "code": unique_code,
            "type": "coupon",
            "discount_type": "percentage",
            "discount_percentage": 10.0,
            "active": True
        }
        create_response = requests.post(f"{BASE_URL}/api/promotions", json=payload)
        assert create_response.status_code == 200
        promo_id = create_response.json()["id"]
        
        # Update the promotion
        update_payload = {
            "name": "TEST Updated Coupon",
            "code": unique_code,
            "type": "coupon",
            "discount_type": "percentage",
            "discount_percentage": 25.0,  # Changed
            "usage_limit": 100,  # Added
            "active": True
        }
        update_response = requests.put(f"{BASE_URL}/api/promotions/{promo_id}", json=update_payload)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["name"] == "TEST Updated Coupon"
        assert updated["discount_percentage"] == 25.0
        assert updated["usage_limit"] == 100
        print(f"Updated promotion: discount changed to {updated['discount_percentage']}%")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/promotions/{promo_id}")
    
    def test_delete_promotion(self):
        """DELETE /api/promotions/{id} deletes a promotion"""
        # First create a promotion
        unique_code = f"DEL{uuid.uuid4().hex[:6].upper()}"
        payload = {
            "name": "TEST Delete Me",
            "code": unique_code,
            "type": "coupon",
            "discount_type": "percentage",
            "discount_percentage": 5.0,
            "active": True
        }
        create_response = requests.post(f"{BASE_URL}/api/promotions", json=payload)
        assert create_response.status_code == 200
        promo_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/promotions/{promo_id}")
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/promotions")
        promos = get_response.json()
        assert not any(p["id"] == promo_id for p in promos)
        print(f"Deleted promotion: {promo_id}")


class TestPromotionsValidation:
    """Tests for coupon code validation endpoint"""
    
    def test_validate_existing_coupon_ny2026(self):
        """POST /api/promotions/validate validates NY2026 coupon"""
        payload = {"code": "NY2026", "program_id": "1", "currency": "aed"}
        response = requests.post(f"{BASE_URL}/api/promotions/validate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == "NY2026"
        assert data["discount_type"] == "percentage"
        assert data["discount_percentage"] == 15.0
        print(f"Validated NY2026: {data['discount_percentage']}% off")
    
    def test_validate_existing_coupon_early50(self):
        """POST /api/promotions/validate validates EARLY50 early bird"""
        payload = {"code": "EARLY50", "program_id": "1", "currency": "inr"}
        response = requests.post(f"{BASE_URL}/api/promotions/validate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == "EARLY50"
        assert data["discount_type"] == "fixed"
        assert data["discount_aed"] == 50.0
        assert data["discount_inr"] == 1000.0
        assert data["discount_usd"] == 15.0
        print(f"Validated EARLY50: AED {data['discount_aed']} / INR {data['discount_inr']} / USD {data['discount_usd']} off")
    
    def test_validate_invalid_code(self):
        """POST /api/promotions/validate rejects invalid code"""
        payload = {"code": "INVALIDCODE123", "program_id": "1"}
        response = requests.post(f"{BASE_URL}/api/promotions/validate", json=payload)
        assert response.status_code == 404
        data = response.json()
        assert "invalid" in data["detail"].lower() or "expired" in data["detail"].lower()
        print(f"Invalid code correctly rejected: {data['detail']}")
    
    def test_validate_empty_code(self):
        """POST /api/promotions/validate rejects empty code"""
        payload = {"code": "", "program_id": "1"}
        response = requests.post(f"{BASE_URL}/api/promotions/validate", json=payload)
        assert response.status_code == 400
        data = response.json()
        assert "enter" in data["detail"].lower() or "code" in data["detail"].lower()
        print(f"Empty code correctly rejected: {data['detail']}")
    
    def test_validate_program_specific_coupon(self):
        """POST /api/promotions/validate checks program applicability"""
        # Create a program-specific coupon
        unique_code = f"PVAL{uuid.uuid4().hex[:6].upper()}"
        create_payload = {
            "name": "TEST Program Specific",
            "code": unique_code,
            "type": "coupon",
            "discount_type": "percentage",
            "discount_percentage": 10.0,
            "applicable_to": "specific",
            "applicable_program_ids": ["1"],
            "active": True
        }
        create_response = requests.post(f"{BASE_URL}/api/promotions", json=create_payload)
        assert create_response.status_code == 200
        promo_id = create_response.json()["id"]
        
        # Valid for program 1
        valid_response = requests.post(f"{BASE_URL}/api/promotions/validate", json={
            "code": unique_code, "program_id": "1"
        })
        assert valid_response.status_code == 200
        assert valid_response.json()["valid"] == True
        
        # Invalid for program 2
        invalid_response = requests.post(f"{BASE_URL}/api/promotions/validate", json={
            "code": unique_code, "program_id": "2"
        })
        assert invalid_response.status_code == 400
        print(f"Program-specific coupon correctly validated for allowed program only")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/promotions/{promo_id}")


class TestActivePromotions:
    """Tests for active promotions filter endpoint"""
    
    def test_get_active_promotions(self):
        """GET /api/promotions/active returns only valid active promotions"""
        response = requests.get(f"{BASE_URL}/api/promotions/active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All should be active
        for promo in data:
            assert promo["active"] == True
        print(f"GET /api/promotions/active: {len(data)} active promotions")
    
    def test_get_active_promotions_by_program(self):
        """GET /api/promotions/active?program_id=1 filters by program"""
        response = requests.get(f"{BASE_URL}/api/promotions/active?program_id=1")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"GET /api/promotions/active?program_id=1: {len(data)} promotions for program 1")


class TestProgramNewFields:
    """Tests for new program fields: session_mode, end_date, is_flagship, duration_tiers"""
    
    def test_get_program_1_has_new_fields(self):
        """GET /api/programs/1 returns program with all new fields"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        data = response.json()
        
        # session_mode field
        assert "session_mode" in data
        assert data["session_mode"] in ["online", "remote", "both"]
        print(f"session_mode: {data['session_mode']}")
        
        # end_date field
        assert "end_date" in data
        print(f"end_date: {data['end_date']}")
        
        # is_flagship field
        assert "is_flagship" in data
        assert data["is_flagship"] == True  # Program 1 is flagship
        print(f"is_flagship: {data['is_flagship']}")
        
        # duration_tiers field
        assert "duration_tiers" in data
        assert isinstance(data["duration_tiers"], list)
        assert len(data["duration_tiers"]) == 3  # 1 Month, 3 Months, 1 Year
        print(f"duration_tiers count: {len(data['duration_tiers'])}")
        
        # Verify tier structure
        for tier in data["duration_tiers"]:
            assert "label" in tier
            assert "duration_value" in tier
            assert "duration_unit" in tier
            assert "price_aed" in tier
            assert "price_inr" in tier
            assert "price_usd" in tier
            print(f"  Tier: {tier['label']} - AED {tier['price_aed']}, INR {tier['price_inr']}, USD {tier['price_usd']}")
    
    def test_update_program_new_fields(self):
        """PUT /api/programs/{id} accepts new fields"""
        # Get current program data
        get_response = requests.get(f"{BASE_URL}/api/programs/1")
        assert get_response.status_code == 200
        original = get_response.json()
        
        # Update with modified fields
        update_payload = {
            "title": original["title"],
            "category": original["category"],
            "description": original["description"],
            "image": original["image"],
            "session_mode": "both",  # Test updating session_mode
            "end_date": "March 31, 2027",  # Test updating end_date
            "is_flagship": True,
            "duration_tiers": original["duration_tiers"],
            "price_aed": original["price_aed"],
            "price_inr": original["price_inr"],
            "price_usd": original["price_usd"]
        }
        
        update_response = requests.put(f"{BASE_URL}/api/programs/1", json=update_payload)
        assert update_response.status_code == 200
        updated = update_response.json()
        
        assert updated["session_mode"] == "both"
        assert updated["end_date"] == "March 31, 2027"
        print(f"Updated program session_mode to: {updated['session_mode']}")
        print(f"Updated program end_date to: {updated['end_date']}")
    
    def test_create_program_with_duration_tiers(self):
        """POST /api/programs accepts duration_tiers for new program"""
        payload = {
            "title": "TEST Program with Tiers",
            "category": "Test",
            "description": "Test program with duration tiers",
            "image": "",
            "session_mode": "online",
            "is_flagship": True,
            "is_upcoming": False,
            "visible": False,  # Don't show on live site
            "duration_tiers": [
                {"label": "1 Week", "duration_value": 1, "duration_unit": "week", "price_aed": 99, "price_inr": 1999, "price_usd": 29},
                {"label": "1 Month", "duration_value": 1, "duration_unit": "month", "price_aed": 299, "price_inr": 5999, "price_usd": 79}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/programs", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["session_mode"] == "online"
        assert data["is_flagship"] == True
        assert len(data["duration_tiers"]) == 2
        print(f"Created test program with {len(data['duration_tiers'])} duration tiers")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/programs/{data['id']}")


class TestExistingPromotions:
    """Tests for pre-existing test promotions NY2026 and EARLY50"""
    
    def test_ny2026_exists_with_correct_config(self):
        """Verify NY2026 coupon exists with 15% off"""
        response = requests.get(f"{BASE_URL}/api/promotions")
        assert response.status_code == 200
        promos = response.json()
        
        ny2026 = next((p for p in promos if p["code"] == "NY2026"), None)
        assert ny2026 is not None, "NY2026 promotion not found"
        assert ny2026["type"] == "coupon"
        assert ny2026["discount_type"] == "percentage"
        assert ny2026["discount_percentage"] == 15.0
        assert ny2026["active"] == True
        print(f"NY2026 found: {ny2026['discount_percentage']}% off, active={ny2026['active']}")
    
    def test_early50_exists_with_correct_config(self):
        """Verify EARLY50 early bird exists with fixed discounts"""
        response = requests.get(f"{BASE_URL}/api/promotions")
        assert response.status_code == 200
        promos = response.json()
        
        early50 = next((p for p in promos if p["code"] == "EARLY50"), None)
        assert early50 is not None, "EARLY50 promotion not found"
        assert early50["type"] == "early_bird"
        assert early50["discount_type"] == "fixed"
        assert early50["discount_aed"] == 50.0
        assert early50["discount_inr"] == 1000.0
        assert early50["discount_usd"] == 15.0
        assert early50["active"] == True
        print(f"EARLY50 found: AED {early50['discount_aed']} / INR {early50['discount_inr']} / USD {early50['discount_usd']} off")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
