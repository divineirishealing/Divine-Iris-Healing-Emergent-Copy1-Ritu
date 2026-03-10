"""
Enrollment API Tests - Multi-step enrollment with India-gating
Tests: /api/enrollment/* endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API_URL = f"{BASE_URL}/api"

# Test program ID (Atomic Weight Release Program)
TEST_PROGRAM_ID = "1"
TEST_PROGRAM_TYPE = "program"


class TestEnrollmentStart:
    """Test POST /api/enrollment/start - Step 1: Profile creation with IP detection"""
    
    def test_enrollment_start_success(self):
        """Test creating enrollment with valid profile data"""
        payload = {
            "name": "TEST_User_Enrollment",
            "relationship": "Single",
            "age": 30,
            "gender": "Female",
            "country": "IN"
        }
        response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "enrollment_id" in data
        assert data["step"] == 1
        assert "ip_country" in data
        assert "vpn_detected" in data
        assert isinstance(data["enrollment_id"], str)
        
        # Store enrollment_id for other tests
        TestEnrollmentStart.enrollment_id = data["enrollment_id"]
        print(f"Created enrollment: {data['enrollment_id']}, VPN detected: {data['vpn_detected']}")
        
    def test_enrollment_start_missing_name(self):
        """Test enrollment fails without required name field"""
        payload = {
            "relationship": "Single",
            "age": 30,
            "gender": "Female",
            "country": "AE"
        }
        response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        assert response.status_code == 422  # Validation error


class TestEnrollmentAttendance:
    """Test PUT /api/enrollment/{id}/attendance - Step 2: Online/Offline mode"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create enrollment for attendance tests"""
        payload = {
            "name": "TEST_Attendance_User",
            "relationship": "Married",
            "age": 35,
            "gender": "Male",
            "country": "AE"
        }
        response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        assert response.status_code == 200
        self.enrollment_id = response.json()["enrollment_id"]
    
    def test_set_attendance_online(self):
        """Test setting attendance mode to online"""
        response = requests.put(
            f"{API_URL}/enrollment/{self.enrollment_id}/attendance",
            json={"mode": "online"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["mode"] == "online"
        assert data["step"] == 2
        assert data["offline_info"] is None  # No offline info for online mode
        
    def test_set_attendance_offline_shows_venue(self):
        """Test setting attendance to offline returns venue info"""
        response = requests.put(
            f"{API_URL}/enrollment/{self.enrollment_id}/attendance",
            json={"mode": "offline"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["mode"] == "offline"
        assert data["offline_info"] is not None
        assert "venue" in data["offline_info"]
        assert "Divine Iris" in data["offline_info"]["venue"]
        
    def test_set_attendance_invalid_mode(self):
        """Test invalid attendance mode rejected"""
        response = requests.put(
            f"{API_URL}/enrollment/{self.enrollment_id}/attendance",
            json={"mode": "hybrid"}  # Invalid
        )
        assert response.status_code == 400
        
    def test_set_attendance_not_found(self):
        """Test attendance update for non-existent enrollment"""
        fake_id = str(uuid.uuid4())
        response = requests.put(
            f"{API_URL}/enrollment/{fake_id}/attendance",
            json={"mode": "online"}
        )
        assert response.status_code == 404


class TestEmailValidation:
    """Test POST /api/enrollment/{id}/validate-email - Step 3a: Email validation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create enrollment for email tests"""
        payload = {
            "name": "TEST_Email_User",
            "relationship": "Single",
            "age": 28,
            "gender": "Female",
            "country": "IN"
        }
        response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        assert response.status_code == 200
        self.enrollment_id = response.json()["enrollment_id"]
    
    def test_validate_email_success(self):
        """Test valid email passes validation"""
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/validate-email",
            json={"email": "test@gmail.com"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] is True
        assert "gmail.com" in data["email"]
        
    def test_validate_email_invalid_format(self):
        """Test invalid email format rejected"""
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/validate-email",
            json={"email": "notanemail"}
        )
        assert response.status_code == 400
        assert "format" in response.json()["detail"].lower()
        
    def test_validate_email_invalid_domain_mx(self):
        """Test email with non-existent domain rejected (MX check)"""
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/validate-email",
            json={"email": "user@thisfakedomain12345xyz.com"}
        )
        assert response.status_code == 400
        assert "domain" in response.json()["detail"].lower()
        
    def test_validate_email_disposable_rejected(self):
        """Test disposable email addresses rejected"""
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/validate-email",
            json={"email": "user@tempmail.com"}
        )
        assert response.status_code == 400
        assert "disposable" in response.json()["detail"].lower()


class TestPhoneOTP:
    """Test POST /api/enrollment/{id}/send-otp and verify-otp - Step 3b: Phone verification"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create enrollment for OTP tests"""
        payload = {
            "name": "TEST_OTP_User",
            "relationship": "Single",
            "age": 25,
            "gender": "Male",
            "country": "IN"
        }
        response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        assert response.status_code == 200
        self.enrollment_id = response.json()["enrollment_id"]
        
    def test_send_otp_success(self):
        """Test OTP is sent and mock_otp returned for testing"""
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/send-otp",
            json={"phone": "9876543210", "country_code": "+91"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["sent"] is True
        assert "mock_otp" in data  # Mock OTP for testing
        assert len(data["mock_otp"]) == 6
        assert data["mock_otp"].isdigit()
        
        # Store for verification test
        TestPhoneOTP.mock_otp = data["mock_otp"]
        TestPhoneOTP.enrollment_id = self.enrollment_id
        
    def test_send_otp_invalid_phone(self):
        """Test invalid phone number rejected"""
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/send-otp",
            json={"phone": "123", "country_code": "+91"}  # Too short
        )
        assert response.status_code == 400
        
    def test_verify_otp_success(self):
        """Test correct OTP verifies successfully"""
        # First send OTP
        send_response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/send-otp",
            json={"phone": "9876543211", "country_code": "+91"}
        )
        assert send_response.status_code == 200
        mock_otp = send_response.json()["mock_otp"]
        
        # Then verify with correct OTP
        verify_response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/verify-otp",
            json={"phone": "9876543211", "country_code": "+91", "otp": mock_otp}
        )
        assert verify_response.status_code == 200
        
        data = verify_response.json()
        assert data["verified"] is True
        
    def test_verify_otp_wrong_code(self):
        """Test wrong OTP is rejected"""
        # First send OTP
        send_response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/send-otp",
            json={"phone": "9876543212", "country_code": "+91"}
        )
        assert send_response.status_code == 200
        
        # Then verify with wrong OTP
        verify_response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/verify-otp",
            json={"phone": "9876543212", "country_code": "+91", "otp": "000000"}  # Wrong
        )
        assert verify_response.status_code == 400
        assert "incorrect" in verify_response.json()["detail"].lower()


class TestPricing:
    """Test GET /api/enrollment/{id}/pricing - Step 4: Pricing with India-gating"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create full enrollment flow for pricing tests"""
        # Create enrollment with India profile
        payload = {
            "name": "TEST_Pricing_User",
            "relationship": "Married",
            "age": 40,
            "gender": "Female",
            "country": "IN"  # Claiming India
        }
        response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        assert response.status_code == 200
        self.enrollment_id = response.json()["enrollment_id"]
        self.vpn_detected = response.json()["vpn_detected"]
        
    def test_pricing_returns_aed_when_vpn_detected(self):
        """Test VPN detection forces AED pricing (preview server detected as US/hosting)"""
        # In preview environment, IP is always detected as VPN/hosting
        response = requests.get(
            f"{API_URL}/enrollment/{self.enrollment_id}/pricing?item_type={TEST_PROGRAM_TYPE}&item_id={TEST_PROGRAM_ID}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "pricing" in data
        assert "security" in data
        
        # Security checks returned
        assert "checks" in data["security"]
        checks = data["security"]["checks"]
        assert "ip_is_india" in checks
        assert "claimed_india" in checks
        assert "no_vpn" in checks
        assert "phone_is_indian" in checks
        
        # VPN detected should show AED (since preview server is detected as US hosting)
        if data["security"]["vpn_blocked"]:
            assert data["pricing"]["currency"] == "aed"
            assert data["security"]["fraud_warning"] is not None
            print(f"VPN detected - AED pricing: {data['pricing']['symbol']}{data['pricing']['final_price']}")
        else:
            print(f"No VPN - currency: {data['pricing']['currency']}, price: {data['pricing']['final_price']}")
            
    def test_pricing_shows_security_checks(self):
        """Test pricing response includes all security verification checks"""
        response = requests.get(
            f"{API_URL}/enrollment/{self.enrollment_id}/pricing?item_type={TEST_PROGRAM_TYPE}&item_id={TEST_PROGRAM_ID}"
        )
        assert response.status_code == 200
        
        data = response.json()
        security = data["security"]
        
        # All security fields present
        assert "vpn_blocked" in security
        assert "fraud_warning" in security
        assert "checks" in security
        assert "ip_country" in security
        assert "claimed_country" in security
        assert "country_mismatch" in security
        assert "inr_eligible" in security
        
    def test_pricing_item_details(self):
        """Test pricing returns correct item information"""
        response = requests.get(
            f"{API_URL}/enrollment/{self.enrollment_id}/pricing?item_type={TEST_PROGRAM_TYPE}&item_id={TEST_PROGRAM_ID}"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "item" in data
        assert data["item"]["id"] == TEST_PROGRAM_ID
        assert "title" in data["item"]
        assert data["item"]["title"] == "Atomic Weight Release Program (AWRP)"


class TestBINValidation:
    """Test POST /api/enrollment/{id}/validate-bin - Card BIN validation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create enrollment for BIN tests"""
        payload = {
            "name": "TEST_BIN_User",
            "relationship": "Single",
            "age": 32,
            "gender": "Male",
            "country": "IN"  # Claiming India
        }
        response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        assert response.status_code == 200
        self.enrollment_id = response.json()["enrollment_id"]
        
    def test_bin_validation_indian_card(self):
        """Test Indian bank BIN passes validation"""
        # Use known Indian BIN (HDFC, Visa)
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/validate-bin",
            json={"bin_number": "400837"}  # Indian BIN prefix
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] is True
        assert data["is_indian_card"] is True
        print(f"Indian BIN validated: {data}")
        
    def test_bin_validation_non_indian_card_when_claiming_india(self):
        """Test non-Indian card blocked when user claims India"""
        # Use US BIN
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/validate-bin",
            json={"bin_number": "411111"}  # Typical US test BIN
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should be flagged as non-Indian card
        assert data["is_indian_card"] is False
        # Message should warn about AED pricing
        assert "AED" in data["message"]
        print(f"Non-Indian BIN result: {data}")
        
    def test_bin_validation_invalid_format(self):
        """Test invalid BIN format rejected"""
        response = requests.post(
            f"{API_URL}/enrollment/{self.enrollment_id}/validate-bin",
            json={"bin_number": "123"}  # Too short
        )
        assert response.status_code == 400
        assert "6 digits" in response.json()["detail"]


class TestEnrollmentGet:
    """Test GET /api/enrollment/{id} - Get enrollment status"""
    
    def test_get_enrollment_success(self):
        """Test getting enrollment by ID"""
        # First create enrollment
        payload = {
            "name": "TEST_Get_User",
            "relationship": "Single",
            "age": 27,
            "gender": "Female",
            "country": "AE"
        }
        create_response = requests.post(f"{API_URL}/enrollment/start", json=payload)
        assert create_response.status_code == 200
        enrollment_id = create_response.json()["enrollment_id"]
        
        # Get enrollment
        get_response = requests.get(f"{API_URL}/enrollment/{enrollment_id}")
        assert get_response.status_code == 200
        
        data = get_response.json()
        assert data["id"] == enrollment_id
        assert data["profile"]["name"] == "TEST_Get_User"
        assert data["profile"]["country"] == "AE"
        assert "ip_info" in data
        
    def test_get_enrollment_not_found(self):
        """Test 404 for non-existent enrollment"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/enrollment/{fake_id}")
        assert response.status_code == 404


class TestFullEnrollmentFlow:
    """Integration test - full enrollment flow end-to-end"""
    
    def test_complete_enrollment_flow(self):
        """Test complete enrollment: profile → attendance → email → OTP → pricing"""
        # Step 1: Profile
        profile_response = requests.post(f"{API_URL}/enrollment/start", json={
            "name": "TEST_Full_Flow_User",
            "relationship": "Married",
            "age": 45,
            "gender": "Female",
            "country": "IN"
        })
        assert profile_response.status_code == 200
        enrollment_id = profile_response.json()["enrollment_id"]
        print(f"Step 1 - Profile created: {enrollment_id}")
        
        # Step 2: Attendance
        attendance_response = requests.put(
            f"{API_URL}/enrollment/{enrollment_id}/attendance",
            json={"mode": "online"}
        )
        assert attendance_response.status_code == 200
        assert attendance_response.json()["step"] == 2
        print("Step 2 - Attendance set to online")
        
        # Step 3a: Email validation
        email_response = requests.post(
            f"{API_URL}/enrollment/{enrollment_id}/validate-email",
            json={"email": "fullflow@gmail.com"}
        )
        assert email_response.status_code == 200
        assert email_response.json()["valid"] is True
        print("Step 3a - Email validated")
        
        # Step 3b: Send OTP
        otp_send_response = requests.post(
            f"{API_URL}/enrollment/{enrollment_id}/send-otp",
            json={"phone": "9876543999", "country_code": "+91"}
        )
        assert otp_send_response.status_code == 200
        mock_otp = otp_send_response.json()["mock_otp"]
        print(f"Step 3b - OTP sent: {mock_otp}")
        
        # Step 3b: Verify OTP
        otp_verify_response = requests.post(
            f"{API_URL}/enrollment/{enrollment_id}/verify-otp",
            json={"phone": "9876543999", "country_code": "+91", "otp": mock_otp}
        )
        assert otp_verify_response.status_code == 200
        assert otp_verify_response.json()["verified"] is True
        print("Step 3b - Phone verified")
        
        # Step 4: Get pricing
        pricing_response = requests.get(
            f"{API_URL}/enrollment/{enrollment_id}/pricing?item_type=program&item_id=1"
        )
        assert pricing_response.status_code == 200
        pricing_data = pricing_response.json()
        print(f"Step 4 - Pricing: {pricing_data['pricing']['currency'].upper()} {pricing_data['pricing']['final_price']}")
        print(f"Security checks: {pricing_data['security']['checks']}")
        
        # Verify final enrollment state
        final_enrollment = requests.get(f"{API_URL}/enrollment/{enrollment_id}")
        assert final_enrollment.status_code == 200
        enrollment_data = final_enrollment.json()
        
        assert enrollment_data["email_verified"] is True
        assert enrollment_data["phone_verified"] is True
        assert enrollment_data["attendance"] == "online"
        assert enrollment_data["status"] == "contact_verified"
        print("Full flow completed successfully!")
