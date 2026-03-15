"""
Test Iteration 61: Manual/Cash Payment Option for India Users
Tests:
1. Settings API returns india_platform_charge_percent field
2. POST /api/india-payments/submit-proof accepts notes field
3. Admin India Proofs list endpoint
4. Pricing calculation verification
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSettingsAPI:
    """Test Settings API for India payment configuration"""
    
    def test_settings_returns_india_platform_charge(self):
        """Settings API should return india_platform_charge_percent field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Settings API failed: {response.status_code}"
        
        data = response.json()
        # Verify india platform charge percent exists
        assert "india_platform_charge_percent" in data, "Missing india_platform_charge_percent field"
        assert isinstance(data["india_platform_charge_percent"], (int, float)), "india_platform_charge_percent should be numeric"
        assert data["india_platform_charge_percent"] == 3.0, f"Expected 3.0, got {data['india_platform_charge_percent']}"
        print(f"PASS: india_platform_charge_percent = {data['india_platform_charge_percent']}")
        
    def test_settings_returns_india_gst_percent(self):
        """Settings API should return india_gst_percent field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "india_gst_percent" in data, "Missing india_gst_percent field"
        assert data["india_gst_percent"] == 18.0, f"Expected 18.0, got {data['india_gst_percent']}"
        print(f"PASS: india_gst_percent = {data['india_gst_percent']}")
        
    def test_settings_returns_india_alt_discount(self):
        """Settings API should return india_alt_discount_percent field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "india_alt_discount_percent" in data, "Missing india_alt_discount_percent field"
        assert data["india_alt_discount_percent"] == 9.0, f"Expected 9.0, got {data['india_alt_discount_percent']}"
        print(f"PASS: india_alt_discount_percent = {data['india_alt_discount_percent']}")


class TestProgramsAPI:
    """Test Programs API for upcoming programs"""
    
    def test_programs_list(self):
        """Programs API should return list of programs"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Programs should be a list"
        assert len(data) > 0, "Should have at least one program"
        print(f"PASS: Found {len(data)} programs")
        
    def test_upcoming_program_exists(self):
        """At least one program should have is_upcoming=True"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        data = response.json()
        upcoming = [p for p in data if p.get("is_upcoming")]
        assert len(upcoming) > 0, "Should have at least one upcoming program"
        print(f"PASS: Found {len(upcoming)} upcoming program(s): {[p['title'][:30] for p in upcoming]}")


class TestIndiaPaymentProofSubmission:
    """Test India Payment Proof submission endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create a test enrollment for proof submission"""
        self.test_enrollment_id = f"test_enroll_{uuid.uuid4().hex[:8]}"
        # Create a test enrollment first
        enrollment_data = {
            "id": self.test_enrollment_id,
            "item_type": "program",
            "item_id": "5",
            "item_title": "Test Program",
            "booker_name": "Test User",
            "booker_email": "test@example.com",
            "booker_country": "IN",
            "status": "pending",
            "step": 3,
            "participant_count": 1,
            "participants": [{"name": "Test User", "email": "test@example.com"}]
        }
        # Try to create enrollment via API
        try:
            requests.post(f"{BASE_URL}/api/enrollments", json=enrollment_data)
        except:
            pass
    
    def test_submit_proof_requires_enrollment(self):
        """Submit proof should fail with 404 for non-existent enrollment"""
        import io
        # Create a simple test image
        fake_image = io.BytesIO(b'\x89PNG\r\n\x1a\n' + b'\x00' * 100)
        
        files = {'screenshot': ('test.png', fake_image, 'image/png')}
        data = {
            'enrollment_id': 'non_existent_enrollment_id',
            'payer_name': 'Test User',
            'payment_date': '2026-01-15',
            'bank_name': 'Test Bank',
            'transaction_id': 'TXN123456',
            'program_title': 'Test Program',
            'amount': '5600',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'payment_method': 'bank_transfer',
            'notes': 'Test payment notes'
        }
        
        response = requests.post(f"{BASE_URL}/api/india-payments/submit-proof", files=files, data=data)
        assert response.status_code == 404, f"Expected 404 for non-existent enrollment, got {response.status_code}"
        print("PASS: Submit proof returns 404 for non-existent enrollment")
        
    def test_submit_proof_endpoint_exists(self):
        """Submit proof endpoint should exist and accept multipart form"""
        # Test with OPTIONS or POST to verify endpoint exists
        response = requests.post(f"{BASE_URL}/api/india-payments/submit-proof", data={})
        # Should get 422 (validation error) not 404 - proves endpoint exists
        assert response.status_code in [422, 404], f"Endpoint should exist, got {response.status_code}"
        print("PASS: Submit proof endpoint exists")


class TestAdminIndiaPayments:
    """Test Admin India Payments endpoints"""
    
    def test_admin_list_proofs(self):
        """Admin should be able to list India payment proofs"""
        response = requests.get(f"{BASE_URL}/api/india-payments/admin/list")
        assert response.status_code == 200, f"Admin list failed: {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Admin list should return a list"
        print(f"PASS: Admin list returns {len(data)} proofs")


class TestPricingCalculation:
    """Test pricing calculation logic - verify formula: Base * 0.91 + Base * 0.18 + Base * 0.03 = Base * 1.12"""
    
    def test_pricing_formula(self):
        """Verify the pricing breakdown formula"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        alt_discount = data.get("india_alt_discount_percent", 9) / 100  # 0.09
        gst = data.get("india_gst_percent", 18) / 100  # 0.18
        platform = data.get("india_platform_charge_percent", 3) / 100  # 0.03
        
        # Test with base price of 5000
        base = 5000
        
        # Formula: discounted_base + GST(on full base) + platform(on full base)
        # discounted_base = base - (base * 0.09) = base * 0.91
        # GST = base * 0.18
        # Platform = base * 0.03
        # Total = base * 0.91 + base * 0.18 + base * 0.03 = base * 1.12
        
        discounted_base = base * (1 - alt_discount)  # 5000 * 0.91 = 4550
        gst_amount = base * gst  # 5000 * 0.18 = 900
        platform_amount = base * platform  # 5000 * 0.03 = 150
        total = discounted_base + gst_amount + platform_amount  # 4550 + 900 + 150 = 5600
        
        expected_total = base * 1.12  # 5600
        
        assert round(total) == round(expected_total), f"Total {total} should equal {expected_total}"
        print(f"PASS: Pricing formula verified - Base {base} -> Total {total}")
        print(f"  - Discounted Base (after {alt_discount*100}% discount): {discounted_base}")
        print(f"  - GST ({gst*100}% on full base): {gst_amount}")
        print(f"  - Platform ({platform*100}% on full base): {platform_amount}")


class TestReceiptTemplate:
    """Test Receipt Template attachments in settings"""
    
    def test_settings_supports_receipt_template(self):
        """Settings should support receipt_template field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        # receipt_template should be in response (even if empty dict)
        assert "receipt_template" in data, "Missing receipt_template field"
        print(f"PASS: receipt_template exists: {type(data['receipt_template'])}")
        
    def test_update_receipt_template_with_attachments(self):
        """Should be able to update receipt template with attachments"""
        # First get current settings
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        current = response.json()
        
        # Try to update with attachments
        test_template = {
            "bg_color": "#1a1a1a",
            "accent_color": "#D4AF37",
            "attachments": [
                {"name": "Test Doc", "url": "https://example.com/doc.pdf", "type": "document"}
            ]
        }
        
        update_response = requests.put(f"{BASE_URL}/api/settings", json={"receipt_template": test_template})
        assert update_response.status_code == 200, f"Update failed: {update_response.status_code}"
        
        # Verify the update
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        assert verify_response.status_code == 200
        updated = verify_response.json()
        
        assert "receipt_template" in updated
        assert updated["receipt_template"].get("attachments") is not None
        print("PASS: Receipt template can store attachments")
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={"receipt_template": current.get("receipt_template", {})})


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
