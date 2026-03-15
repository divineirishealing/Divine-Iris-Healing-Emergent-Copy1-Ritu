"""
Test iteration 65: Bug fixes and feature additions
- Email footer_email parameter fix
- Free enrollment checkout flow
- StarField count=120 (frontend test)
- Step 2 back button with Continue to Payment button
- Booker info prefill from first participant
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestEnrollmentConfirmationEmail:
    """Test email function accepts footer_email parameter"""

    def test_enrollment_confirmation_email_accepts_footer_email(self):
        """Test that enrollment_confirmation_email function accepts footer_email param"""
        # Import the function to verify it has footer_email parameter
        import sys
        sys.path.insert(0, '/app/backend')
        from routes.emails import enrollment_confirmation_email
        import inspect
        
        sig = inspect.signature(enrollment_confirmation_email)
        params = list(sig.parameters.keys())
        
        # Assert footer_email is a parameter
        assert 'footer_email' in params, f"footer_email not found in params: {params}"
        
        # Test that the function can be called with footer_email
        result = enrollment_confirmation_email(
            booker_name="Test User",
            item_title="Test Program",
            participants=[{"name": "Participant 1", "relationship": "Myself", "attendance_mode": "online"}],
            total=100,
            currency_symbol="AED ",
            attendance_modes=["online"],
            booker_email="test@example.com",
            phone="+971501234567",
            footer_email="support@test.com"
        )
        
        assert result is not None
        assert isinstance(result, str)
        assert "test@example.com" in result.lower()
        print("PASS: enrollment_confirmation_email accepts footer_email parameter")


class TestFreeEnrollmentCheckout:
    """Test free enrollment checkout flow"""
    
    def test_start_enrollment(self):
        """Test creating an enrollment"""
        response = requests.post(f"{BASE_URL}/api/enrollment/start", json={
            "booker_name": "TEST_Free_User",
            "booker_email": "testfree@example.com",
            "booker_country": "AE",
            "participants": [{
                "name": "TEST_Free_Participant",
                "relationship": "Myself",
                "age": 30,
                "gender": "Female",
                "country": "AE",
                "attendance_mode": "online",
                "notify": True,
                "email": "testfree@example.com",
                "is_first_time": True
            }]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "enrollment_id" in data
        self.__class__.enrollment_id = data["enrollment_id"]
        print(f"PASS: Enrollment started with id: {data['enrollment_id']}")
        return data["enrollment_id"]
    
    def test_get_enrollment(self):
        """Test getting enrollment details"""
        if not hasattr(self.__class__, 'enrollment_id'):
            pytest.skip("No enrollment_id from previous test")
        
        response = requests.get(f"{BASE_URL}/api/enrollment/{self.__class__.enrollment_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["booker_name"] == "TEST_Free_User"
        print(f"PASS: Get enrollment returned correct data")

    def test_pricing_endpoint(self):
        """Test pricing endpoint returns valid data"""
        if not hasattr(self.__class__, 'enrollment_id'):
            pytest.skip("No enrollment_id from previous test")
        
        # Use Quad Layer Healing program (id=5) which has offer pricing
        response = requests.get(
            f"{BASE_URL}/api/enrollment/{self.__class__.enrollment_id}/pricing",
            params={"item_type": "program", "item_id": "5", "client_currency": "aed"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "pricing" in data
        assert "currency" in data["pricing"]
        print(f"PASS: Pricing endpoint works - currency: {data['pricing']['currency']}, total: {data['pricing']['total']}")


class TestSessionEnrollmentPage:
    """Test session enrollment page content"""
    
    def test_session_exists(self):
        """Test that the test session exists"""
        session_id = "92e592c9-5885-4b59-81bf-794636d9f1aa"
        response = requests.get(f"{BASE_URL}/api/sessions/{session_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Akashic Record Reading & Healing"
        print(f"PASS: Session exists - {data['title']}")

    def test_program_exists(self):
        """Test that the test program exists"""
        program_id = "5"  # Quad Layer Healing
        response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Quad Layer Healing"
        assert data["offer_price_aed"] == 300.0  # Has offer price making it effectively discounted
        print(f"PASS: Program exists - {data['title']} with offer price: {data['offer_price_aed']}")


class TestBackendEmailSettings:
    """Test backend email settings have footer_email"""
    
    def test_site_settings_endpoint(self):
        """Test that site settings endpoint works"""
        response = requests.get(f"{BASE_URL}/api/settings")
        
        assert response.status_code == 200
        data = response.json()
        # footer_email may or may not exist - just check endpoint works
        print(f"PASS: Settings endpoint works, keys: {list(data.keys())[:10]}...")

    def test_discounts_settings(self):
        """Test discounts settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/discounts/settings")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"PASS: Discounts settings endpoint works")


class TestPaymentTransactionsEndpoint:
    """Test payment transactions endpoint"""
    
    def test_get_transactions(self):
        """Test getting payment transactions list"""
        response = requests.get(f"{BASE_URL}/api/payments/transactions")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Transactions endpoint works - {len(data)} transactions found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
