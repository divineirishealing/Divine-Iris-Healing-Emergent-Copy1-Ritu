"""
Test Suite for Iteration 14 - Bug Fixes Verification
Tests for:
1. Image upload (backend API)
2. Offer prices - offer_price_aed field returned by API
3. Phone/WhatsApp country code handling in enrollment
"""

import pytest
import requests
import os
from io import BytesIO

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')
if BASE_URL:
    BASE_URL = BASE_URL.rstrip('/')

# ===================== FIXTURES =====================

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

# ===================== IMAGE UPLOAD TESTS =====================

class TestImageUpload:
    """Tests for image upload endpoint"""
    
    def test_upload_image_endpoint_exists(self, api_client):
        """Test that the image upload endpoint exists"""
        # Create a minimal test image (1x1 pixel PNG)
        from base64 import b64decode
        # Minimal valid PNG file (1x1 pixel)
        png_data = b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        files = {'file': ('test_image.png', BytesIO(png_data), 'image/png')}
        
        # Remove content-type header for multipart upload
        headers = {}
        response = requests.post(f"{BASE_URL}/api/upload/image", files=files, headers=headers)
        
        print(f"Upload response status: {response.status_code}")
        print(f"Upload response: {response.text}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'url' in data, "Response should contain 'url'"
        assert 'filename' in data, "Response should contain 'filename'"
        assert data['url'].startswith('/api/image/'), "URL should start with /api/image/"
        
    def test_upload_invalid_file_type(self, api_client):
        """Test that invalid file types are rejected"""
        # Try to upload a text file
        files = {'file': ('test.txt', BytesIO(b'this is text'), 'text/plain')}
        
        response = requests.post(f"{BASE_URL}/api/upload/image", files=files)
        
        print(f"Invalid upload response: {response.status_code}")
        assert response.status_code == 400, "Should reject non-image files"

# ===================== OFFER PRICE TESTS =====================

class TestOfferPriceAed:
    """Tests for offer_price_aed field in programs API"""
    
    def test_programs_returns_offer_price_aed(self, api_client):
        """Test GET /api/programs returns offer_price_aed field"""
        response = api_client.get(f"{BASE_URL}/api/programs")
        
        assert response.status_code == 200
        programs = response.json()
        assert isinstance(programs, list), "Should return a list of programs"
        
        if len(programs) > 0:
            program = programs[0]
            # Verify offer_price_aed field exists
            assert 'offer_price_aed' in program, "Program should have offer_price_aed field"
            assert 'offer_price_usd' in program, "Program should have offer_price_usd field"
            assert 'offer_price_inr' in program, "Program should have offer_price_inr field"
            print(f"Program '{program['title']}' - offer_price_aed: {program['offer_price_aed']}")
    
    def test_create_program_with_offer_price_aed(self, api_client):
        """Test creating a program with offer_price_aed"""
        test_program = {
            "title": "TEST_Offer_Price_Program",
            "category": "Test",
            "description": "Testing offer_price_aed field",
            "image": "https://example.com/test.jpg",
            "price_aed": 500,
            "price_usd": 136,
            "price_inr": 11000,
            "offer_price_aed": 399,  # Discounted price
            "offer_price_usd": 99,
            "offer_price_inr": 8999,
            "visible": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/programs", json=test_program)
        print(f"Create program response: {response.status_code}")
        print(f"Create program data: {response.text[:500] if response.text else 'No content'}")
        
        assert response.status_code == 201 or response.status_code == 200, f"Expected 200/201, got {response.status_code}"
        
        created = response.json()
        program_id = created.get('id')
        
        # Verify offer prices are set correctly
        assert created.get('offer_price_aed') == 399, f"offer_price_aed should be 399, got {created.get('offer_price_aed')}"
        assert created.get('offer_price_usd') == 99, f"offer_price_usd should be 99, got {created.get('offer_price_usd')}"
        assert created.get('offer_price_inr') == 8999, f"offer_price_inr should be 8999, got {created.get('offer_price_inr')}"
        
        # GET the program to verify persistence
        get_response = api_client.get(f"{BASE_URL}/api/programs/{program_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched.get('offer_price_aed') == 399, "offer_price_aed should persist"
        
        # Cleanup
        delete_response = api_client.delete(f"{BASE_URL}/api/programs/{program_id}")
        print(f"Cleanup delete response: {delete_response.status_code}")
        
    def test_update_program_offer_price_aed(self, api_client):
        """Test updating offer_price_aed on existing program"""
        # First create a program
        test_program = {
            "title": "TEST_Update_Offer_Program",
            "category": "Test",
            "description": "Testing offer_price_aed update",
            "image": "https://example.com/test.jpg",
            "price_aed": 1000,
            "offer_price_aed": 0,
            "visible": True
        }
        
        response = api_client.post(f"{BASE_URL}/api/programs", json=test_program)
        assert response.status_code in [200, 201]
        program_id = response.json().get('id')
        
        # Update with offer price
        update_data = {
            "title": "TEST_Update_Offer_Program",
            "category": "Test",
            "description": "Testing offer_price_aed update",
            "image": "https://example.com/test.jpg",
            "price_aed": 1000,
            "offer_price_aed": 799,  # Set an offer price
            "visible": True
        }
        
        update_response = api_client.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        print(f"Update response: {update_response.status_code}")
        assert update_response.status_code == 200
        
        updated = update_response.json()
        assert updated.get('offer_price_aed') == 799, f"offer_price_aed should be updated to 799, got {updated.get('offer_price_aed')}"
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/programs/{program_id}")

# ===================== ENROLLMENT PHONE TESTS =====================

class TestEnrollmentPhoneFields:
    """Tests for phone and WhatsApp fields with country codes in enrollment"""
    
    def test_enrollment_accepts_phone_with_country_code(self, api_client):
        """Test that enrollment API accepts phone numbers with country code prefix"""
        enrollment_data = {
            "booker_name": "Test User",
            "booker_email": "test@example.com",
            "booker_country": "AE",
            "participants": [
                {
                    "name": "TEST Participant One",
                    "relationship": "Myself",
                    "age": 30,
                    "gender": "Female",
                    "country": "AE",
                    "attendance_mode": "online",
                    "notify": True,
                    "email": "participant@example.com",
                    "phone": "+971501234567",  # Full phone with country code
                    "whatsapp": "+971501234568",  # Full WhatsApp with country code
                    "is_first_time": True,
                    "referral_source": "Instagram"
                }
            ]
        }
        
        response = api_client.post(f"{BASE_URL}/api/enrollment/start", json=enrollment_data)
        print(f"Enrollment start response: {response.status_code}")
        print(f"Enrollment data: {response.text[:500] if response.text else 'No content'}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'enrollment_id' in data, "Response should contain enrollment_id"
        
    def test_enrollment_multiple_country_codes(self, api_client):
        """Test enrollment with various country code formats"""
        test_cases = [
            {"code": "+91", "phone": "+911234567890", "country": "India"},
            {"code": "+1", "phone": "+11234567890", "country": "USA"},
            {"code": "+44", "phone": "+441234567890", "country": "UK"},
        ]
        
        for tc in test_cases:
            enrollment_data = {
                "booker_name": f"Test User {tc['country']}",
                "booker_email": f"test_{tc['country'].lower()}@example.com",
                "booker_country": "AE",
                "participants": [
                    {
                        "name": f"TEST Participant {tc['country']}",
                        "relationship": "Myself",
                        "age": 25,
                        "gender": "Male",
                        "country": "IN" if tc['country'] == "India" else "US" if tc['country'] == "USA" else "GB",
                        "attendance_mode": "online",
                        "notify": True,
                        "email": f"participant_{tc['country'].lower()}@example.com",
                        "phone": tc['phone'],
                        "whatsapp": tc['phone'],
                        "is_first_time": False,
                        "referral_source": "Facebook"
                    }
                ]
            }
            
            response = api_client.post(f"{BASE_URL}/api/enrollment/start", json=enrollment_data)
            print(f"Enrollment for {tc['country']} ({tc['phone']}): {response.status_code}")
            assert response.status_code == 200, f"Failed for {tc['country']}: {response.text}"

# ===================== ADMIN API TESTS =====================

class TestAdminProgramCRUD:
    """Tests for admin program CRUD with offer prices"""
    
    def test_get_single_program_has_offer_fields(self, api_client):
        """Test GET /api/programs/{id} returns offer fields"""
        # First get list of programs
        list_response = api_client.get(f"{BASE_URL}/api/programs")
        programs = list_response.json()
        
        if len(programs) > 0:
            program_id = programs[0]['id']
            response = api_client.get(f"{BASE_URL}/api/programs/{program_id}")
            
            assert response.status_code == 200
            program = response.json()
            
            # Verify offer fields exist
            assert 'offer_price_aed' in program, "Single program should have offer_price_aed"
            assert 'offer_price_usd' in program, "Single program should have offer_price_usd"
            assert 'offer_price_inr' in program, "Single program should have offer_price_inr"
            print(f"Single program '{program['title']}' offer prices - AED: {program['offer_price_aed']}, USD: {program['offer_price_usd']}, INR: {program['offer_price_inr']}")

# ===================== CURRENCY DETECT TESTS =====================

class TestCurrencyDetect:
    """Tests for currency detection API"""
    
    def test_currency_detect_returns_expected_fields(self, api_client):
        """Test /api/currency/detect returns proper structure"""
        response = api_client.get(f"{BASE_URL}/api/currency/detect")
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'currency' in data, "Should have currency field"
        assert 'symbol' in data, "Should have symbol field"
        assert 'country' in data, "Should have country field"
        assert 'rate' in data, "Should have rate field"
        assert 'is_primary' in data, "Should have is_primary field"
        
        print(f"Currency detect: {data}")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
