"""
Iteration 11 - Comprehensive Backend Tests for Major Overhaul Features
Tests: Currency Detection, Exchange Rates, Promo Code Validation, Quote Request, Program Duration Tiers
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestCurrencyDetection:
    """Test currency detection and exchange rates endpoints"""

    def test_currency_detect_endpoint(self):
        """GET /api/currency/detect - should return currency info for user's location"""
        response = requests.get(f"{BASE_URL}/api/currency/detect")
        assert response.status_code == 200
        
        data = response.json()
        assert "currency" in data
        assert "symbol" in data
        assert "country" in data
        assert "rate" in data
        assert "is_primary" in data
        
        # Server is in US, so should detect USD
        assert data["currency"] == "usd"
        assert data["symbol"] == "USD"
        assert data["is_primary"] == True
        assert data["rate"] == 1.0
        print(f"Currency detection: {data}")

    def test_exchange_rates_endpoint(self):
        """GET /api/currency/exchange-rates - should return all exchange rates"""
        response = requests.get(f"{BASE_URL}/api/currency/exchange-rates")
        assert response.status_code == 200
        
        data = response.json()
        assert "base" in data
        assert "rates" in data
        assert data["base"] == "aed"
        assert isinstance(data["rates"], dict)
        
        # Check some expected currencies exist
        rates = data["rates"]
        expected_currencies = ["gbp", "eur", "cad", "aud", "jpy", "inr"]
        for curr in expected_currencies:
            if curr in rates:  # INR/USD might not be in rates (they are primary)
                assert isinstance(rates[curr], (int, float))
                assert rates[curr] > 0
        print(f"Exchange rates base: {data['base']}, {len(rates)} currencies")


class TestPromoCodeValidation:
    """Test promo code validation endpoint"""

    def test_validate_valid_percentage_code(self):
        """POST /api/promotions/validate - valid percentage discount code"""
        response = requests.post(
            f"{BASE_URL}/api/promotions/validate",
            json={"code": "NY2026", "program_id": "1", "currency": "usd"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == "NY2026"
        assert data["discount_type"] == "percentage"
        assert data["discount_percentage"] == 15.0
        assert "message" in data
        print(f"Valid promo NY2026: {data['message']}")

    def test_validate_valid_fixed_code(self):
        """POST /api/promotions/validate - valid fixed discount code"""
        response = requests.post(
            f"{BASE_URL}/api/promotions/validate",
            json={"code": "EARLY50", "program_id": "1", "currency": "usd"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] == True
        assert data["code"] == "EARLY50"
        assert data["discount_type"] == "fixed"
        assert data["discount_aed"] == 50.0
        assert data["discount_usd"] == 15.0
        assert data["discount_inr"] == 1000.0
        print(f"Valid promo EARLY50: {data}")

    def test_validate_invalid_code(self):
        """POST /api/promotions/validate - invalid code should return 404"""
        response = requests.post(
            f"{BASE_URL}/api/promotions/validate",
            json={"code": "INVALIDCODE123", "program_id": "1", "currency": "usd"}
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print(f"Invalid code response: {data}")

    def test_validate_empty_code(self):
        """POST /api/promotions/validate - empty code should return 400"""
        response = requests.post(
            f"{BASE_URL}/api/promotions/validate",
            json={"code": "", "program_id": "1", "currency": "usd"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"Empty code response: {data}")


class TestQuoteRequest:
    """Test quote request endpoint for Annual tier pricing"""

    def test_submit_quote_request(self):
        """POST /api/enrollment/quote-request - should save quote request"""
        response = requests.post(
            f"{BASE_URL}/api/enrollment/quote-request",
            json={
                "name": "TEST_Quote User",
                "email": "test_quote@example.com",
                "phone": "+1234567890",
                "program_id": "1",
                "program_title": "Atomic Weight Release Program (AWRP)",
                "tier_label": "Annual",
                "message": "Interested in the annual program. Please share pricing."
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "id" in data
        assert data["message"] == "Quote request submitted successfully"
        print(f"Quote request submitted: {data}")

    def test_submit_quote_request_missing_fields(self):
        """POST /api/enrollment/quote-request - missing name/email should fail"""
        response = requests.post(
            f"{BASE_URL}/api/enrollment/quote-request",
            json={"name": "", "email": "", "message": "Test"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"Missing fields response: {data}")


class TestProgramDurationTiers:
    """Test program duration tiers in API responses"""

    def test_programs_have_duration_tiers(self):
        """GET /api/programs - all flagship programs should have duration_tiers"""
        response = requests.get(f"{BASE_URL}/api/programs?visible_only=true")
        assert response.status_code == 200
        
        programs = response.json()
        assert len(programs) >= 6
        
        for program in programs:
            if program.get("is_flagship"):
                assert "duration_tiers" in program
                tiers = program["duration_tiers"]
                assert len(tiers) == 3  # 1 Month, 3 Months, Annual
                
                tier_labels = [t["label"] for t in tiers]
                assert "1 Month" in tier_labels
                assert "3 Months" in tier_labels
                assert "Annual" in tier_labels
                
                # Annual tier should have price=0
                annual = next(t for t in tiers if t["label"] == "Annual")
                assert annual["price_aed"] == 0
                assert annual["price_inr"] == 0
                assert annual["price_usd"] == 0
                
                # Other tiers should have prices > 0
                month1 = next(t for t in tiers if t["label"] == "1 Month")
                assert month1["price_usd"] > 0
                
        print(f"Verified duration tiers for {len(programs)} programs")

    def test_single_program_has_tiers(self):
        """GET /api/programs/1 - single program should have duration_tiers"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        
        program = response.json()
        assert program["is_flagship"] == True
        assert "duration_tiers" in program
        assert len(program["duration_tiers"]) == 3
        print(f"Program 1 tiers: {[t['label'] for t in program['duration_tiers']]}")


class TestEnrollmentFlow:
    """Test enrollment flow endpoints"""

    def test_enrollment_start(self):
        """POST /api/enrollment/start - should create enrollment with participants"""
        response = requests.post(
            f"{BASE_URL}/api/enrollment/start",
            json={
                "booker_name": "TEST_Enrollment User",
                "booker_email": "test_enroll@gmail.com",
                "booker_country": "US",
                "participants": [
                    {
                        "name": "Participant One",
                        "relationship": "Myself",
                        "age": 30,
                        "gender": "Female",
                        "country": "US",
                        "attendance_mode": "online",
                        "notify": False
                    }
                ]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "enrollment_id" in data
        assert data["participant_count"] == 1
        assert "ip_country" in data
        print(f"Enrollment started: {data}")
        return data["enrollment_id"]

    def test_enrollment_send_otp(self):
        """POST /api/enrollment/{id}/send-otp - should send mock OTP"""
        # First create enrollment
        enroll_resp = requests.post(
            f"{BASE_URL}/api/enrollment/start",
            json={
                "booker_name": "TEST_OTP User",
                "booker_email": "test_otp@gmail.com",
                "booker_country": "US",
                "participants": [
                    {
                        "name": "Participant One",
                        "relationship": "Myself",
                        "age": 30,
                        "gender": "Female",
                        "country": "US",
                        "attendance_mode": "online",
                        "notify": False
                    }
                ]
            }
        )
        enrollment_id = enroll_resp.json()["enrollment_id"]
        
        # Send OTP
        response = requests.post(
            f"{BASE_URL}/api/enrollment/{enrollment_id}/send-otp",
            json={"phone": "1234567890", "country_code": "+1"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["sent"] == True
        assert "mock_otp" in data  # MOCKED - OTP returned in response for testing
        assert len(data["mock_otp"]) == 6
        print(f"OTP sent (mock): {data['mock_otp']}")
        return enrollment_id, data["mock_otp"]

    def test_enrollment_verify_otp(self):
        """POST /api/enrollment/{id}/verify-otp - should verify OTP"""
        # Create enrollment and get OTP
        enroll_resp = requests.post(
            f"{BASE_URL}/api/enrollment/start",
            json={
                "booker_name": "TEST_Verify User",
                "booker_email": "test_verify@gmail.com",
                "booker_country": "US",
                "participants": [
                    {
                        "name": "Participant One",
                        "relationship": "Myself",
                        "age": 30,
                        "gender": "Female",
                        "country": "US",
                        "attendance_mode": "online",
                        "notify": False
                    }
                ]
            }
        )
        enrollment_id = enroll_resp.json()["enrollment_id"]
        
        # Send OTP
        otp_resp = requests.post(
            f"{BASE_URL}/api/enrollment/{enrollment_id}/send-otp",
            json={"phone": "1234567890", "country_code": "+1"}
        )
        mock_otp = otp_resp.json()["mock_otp"]
        
        # Verify OTP
        response = requests.post(
            f"{BASE_URL}/api/enrollment/{enrollment_id}/verify-otp",
            json={"phone": "1234567890", "country_code": "+1", "otp": mock_otp}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["verified"] == True
        print(f"OTP verified: {data}")


class TestSupportedCurrencies:
    """Test supported currencies endpoint"""

    def test_supported_currencies(self):
        """GET /api/currency/supported - should return list of supported currencies"""
        response = requests.get(f"{BASE_URL}/api/currency/supported")
        assert response.status_code == 200
        
        data = response.json()
        assert "currencies" in data
        currencies = data["currencies"]
        
        # Check expected currencies
        codes = [c["code"] for c in currencies]
        assert "aed" in codes
        assert "usd" in codes
        assert "inr" in codes
        print(f"Supported currencies: {codes}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
