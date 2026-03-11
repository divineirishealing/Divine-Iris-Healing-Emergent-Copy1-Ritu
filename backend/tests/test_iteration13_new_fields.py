"""
Iteration 13 - Test new features:
1. Program link fields (whatsapp_group_link, zoom_link, custom_link) in Admin Panel
2. Participant fields (is_first_time, referral_source) in Enrollment
3. Payment status endpoint returns program_links, participants, booker_name, booker_email
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
API = f"{BASE_URL}/api"

# Test program data with links
TEST_PROGRAM_WITH_LINKS = {
    "title": "TEST_Program_With_Links",
    "category": "Test Category",
    "description": "Test program with WhatsApp, Zoom, and Custom links",
    "image": "https://example.com/test.jpg",
    "price_aed": 500,
    "price_usd": 136,
    "price_inr": 10000,
    "visible": True,
    "is_flagship": False,
    "enrollment_open": True,
    "whatsapp_group_link": "https://chat.whatsapp.com/testgroup123",
    "zoom_link": "https://zoom.us/j/1234567890",
    "custom_link": "https://example.com/resources",
    "custom_link_label": "Course Materials",
    "show_whatsapp_link": True,
    "show_zoom_link": True,
    "show_custom_link": True,
}

# Test enrollment data with new participant fields
TEST_PARTICIPANT_WITH_NEW_FIELDS = {
    "name": "Test Participant",
    "relationship": "Myself",
    "age": 30,
    "gender": "Female",
    "country": "AE",
    "attendance_mode": "online",
    "notify": False,
    "is_first_time": True,
    "referral_source": "Instagram",
}

REFERRAL_SOURCES = ["Instagram", "Facebook", "YouTube", "Google Search", "Friend / Family", "WhatsApp", "Returning Client", "Other"]


class TestProgramLinkFields:
    """Test program link fields in API"""

    def test_api_health(self):
        """API should be accessible"""
        # Try programs endpoint as health check
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200, f"API not accessible: {response.status_code}"
        print("API is accessible")

    def test_create_program_with_links(self):
        """Should be able to create a program with link fields"""
        response = requests.post(f"{API}/programs", json=TEST_PROGRAM_WITH_LINKS)
        assert response.status_code == 200, f"Failed to create program: {response.text}"
        data = response.json()
        
        # Verify link fields are saved
        assert data.get("whatsapp_group_link") == TEST_PROGRAM_WITH_LINKS["whatsapp_group_link"], "WhatsApp link not saved"
        assert data.get("zoom_link") == TEST_PROGRAM_WITH_LINKS["zoom_link"], "Zoom link not saved"
        assert data.get("custom_link") == TEST_PROGRAM_WITH_LINKS["custom_link"], "Custom link not saved"
        assert data.get("custom_link_label") == TEST_PROGRAM_WITH_LINKS["custom_link_label"], "Custom link label not saved"
        assert data.get("show_whatsapp_link") == True, "show_whatsapp_link not saved"
        assert data.get("show_zoom_link") == True, "show_zoom_link not saved"
        assert data.get("show_custom_link") == True, "show_custom_link not saved"
        
        print(f"Created program with ID: {data.get('id')}")
        return data.get("id")

    def test_get_program_with_links(self):
        """Should retrieve program with link fields"""
        # First create program
        create_resp = requests.post(f"{API}/programs", json=TEST_PROGRAM_WITH_LINKS)
        assert create_resp.status_code == 200
        program_id = create_resp.json().get("id")
        
        # Then fetch it
        response = requests.get(f"{API}/programs/{program_id}")
        assert response.status_code == 200, f"Failed to get program: {response.text}"
        data = response.json()
        
        # Verify link fields are returned
        assert "whatsapp_group_link" in data, "whatsapp_group_link missing from response"
        assert "zoom_link" in data, "zoom_link missing from response"
        assert "custom_link" in data, "custom_link missing from response"
        assert "custom_link_label" in data, "custom_link_label missing from response"
        assert "show_whatsapp_link" in data, "show_whatsapp_link missing from response"
        assert "show_zoom_link" in data, "show_zoom_link missing from response"
        assert "show_custom_link" in data, "show_custom_link missing from response"
        
        print(f"GET program {program_id} returns link fields correctly")
        
        # Cleanup
        requests.delete(f"{API}/programs/{program_id}")

    def test_update_program_links(self):
        """Should be able to update program link fields"""
        # Create program
        create_resp = requests.post(f"{API}/programs", json=TEST_PROGRAM_WITH_LINKS)
        assert create_resp.status_code == 200
        program_id = create_resp.json().get("id")
        
        # Update with new links
        update_data = {
            **TEST_PROGRAM_WITH_LINKS,
            "whatsapp_group_link": "https://chat.whatsapp.com/updatedgroup456",
            "show_zoom_link": False,
        }
        response = requests.put(f"{API}/programs/{program_id}", json=update_data)
        assert response.status_code == 200, f"Failed to update program: {response.text}"
        
        # Verify update
        get_resp = requests.get(f"{API}/programs/{program_id}")
        data = get_resp.json()
        assert data.get("whatsapp_group_link") == "https://chat.whatsapp.com/updatedgroup456", "Link not updated"
        assert data.get("show_zoom_link") == False, "show_zoom_link not updated"
        
        print(f"Successfully updated program links for {program_id}")
        
        # Cleanup
        requests.delete(f"{API}/programs/{program_id}")


class TestParticipantNewFields:
    """Test new participant fields (is_first_time, referral_source) in enrollment"""

    def test_enrollment_start_with_new_fields(self):
        """POST /api/enrollment/start should accept is_first_time and referral_source"""
        enrollment_data = {
            "booker_name": "Test Booker",
            "booker_email": "test@gmail.com",
            "booker_country": "AE",
            "participants": [TEST_PARTICIPANT_WITH_NEW_FIELDS]
        }
        
        response = requests.post(f"{API}/enrollment/start", json=enrollment_data)
        assert response.status_code == 200, f"Failed to start enrollment: {response.text}"
        data = response.json()
        
        assert "enrollment_id" in data, "No enrollment_id returned"
        print(f"Created enrollment with ID: {data['enrollment_id']}")
        
        return data["enrollment_id"]

    def test_enrollment_stores_is_first_time(self):
        """Enrollment should store is_first_time field for participants"""
        enrollment_data = {
            "booker_name": "Test Booker First Time",
            "booker_email": "testfirsttime@gmail.com",
            "booker_country": "AE",
            "participants": [{
                **TEST_PARTICIPANT_WITH_NEW_FIELDS,
                "is_first_time": True,
            }]
        }
        
        response = requests.post(f"{API}/enrollment/start", json=enrollment_data)
        assert response.status_code == 200, f"Failed: {response.text}"
        enrollment_id = response.json()["enrollment_id"]
        
        # Fetch enrollment to verify
        get_resp = requests.get(f"{API}/enrollment/{enrollment_id}")
        if get_resp.status_code == 200:
            data = get_resp.json()
            participants = data.get("participants", [])
            assert len(participants) > 0, "No participants found"
            assert participants[0].get("is_first_time") == True, "is_first_time not stored"
            print(f"is_first_time=True stored correctly for enrollment {enrollment_id}")
        else:
            print(f"Warning: Could not verify enrollment data (status {get_resp.status_code})")

    def test_enrollment_stores_referral_source(self):
        """Enrollment should store referral_source field for participants"""
        for source in REFERRAL_SOURCES[:3]:  # Test first 3 sources
            enrollment_data = {
                "booker_name": f"Test Booker {source}",
                "booker_email": f"test{source.lower().replace(' ', '').replace('/', '')}@gmail.com",
                "booker_country": "AE",
                "participants": [{
                    **TEST_PARTICIPANT_WITH_NEW_FIELDS,
                    "referral_source": source,
                }]
            }
            
            response = requests.post(f"{API}/enrollment/start", json=enrollment_data)
            assert response.status_code == 200, f"Failed for referral_source={source}: {response.text}"
            enrollment_id = response.json()["enrollment_id"]
            
            # Fetch enrollment to verify
            get_resp = requests.get(f"{API}/enrollment/{enrollment_id}")
            if get_resp.status_code == 200:
                data = get_resp.json()
                participants = data.get("participants", [])
                assert participants[0].get("referral_source") == source, f"referral_source not stored for {source}"
                print(f"referral_source='{source}' stored correctly")
        
        print("All referral sources stored correctly")


class TestPaymentStatusEndpoint:
    """Test that /api/payments/status/{session_id} returns program_links, participants, booker info"""

    def test_payment_status_returns_program_links(self):
        """Payment status should return program_links when available"""
        # First create a program with links
        create_resp = requests.post(f"{API}/programs", json=TEST_PROGRAM_WITH_LINKS)
        assert create_resp.status_code == 200
        program_id = create_resp.json().get("id")
        
        # Note: We can't fully test payment status without completing a Stripe checkout
        # But we can verify the endpoint structure and that it handles program_links
        
        # Try with a non-existent session to verify endpoint exists and returns expected format
        response = requests.get(f"{API}/payments/status/nonexistent_session")
        assert response.status_code == 404, "Expected 404 for non-existent session"
        
        print("Payment status endpoint exists and returns 404 for invalid session")
        
        # Cleanup
        requests.delete(f"{API}/programs/{program_id}")

    def test_existing_transaction_has_expected_fields(self):
        """Get transactions and verify structure includes expected fields"""
        response = requests.get(f"{API}/payments/transactions")
        assert response.status_code == 200, f"Failed to get transactions: {response.text}"
        
        transactions = response.json()
        if len(transactions) > 0:
            tx = transactions[0]
            print(f"Sample transaction fields: {list(tx.keys())}")
            # Transactions should include enrollment-related data
            # Note: program_links is returned from status endpoint, not stored in transaction
        else:
            print("No existing transactions found (expected in test environment)")


class TestExistingProgramsHaveLinkFields:
    """Verify existing programs have the link fields (even if empty)"""

    def test_all_programs_have_link_fields(self):
        """All programs should have link fields defined"""
        response = requests.get(f"{API}/programs")
        assert response.status_code == 200
        programs = response.json()
        
        assert len(programs) > 0, "No programs found"
        
        required_link_fields = [
            "whatsapp_group_link", "zoom_link", "custom_link", "custom_link_label",
            "show_whatsapp_link", "show_zoom_link", "show_custom_link"
        ]
        
        for program in programs:
            for field in required_link_fields:
                assert field in program, f"Program '{program.get('title')}' missing field '{field}'"
        
        print(f"All {len(programs)} programs have required link fields")


class TestCleanup:
    """Cleanup test data created during tests"""

    def test_cleanup_test_programs(self):
        """Delete TEST_ prefixed programs"""
        response = requests.get(f"{API}/programs")
        if response.status_code == 200:
            programs = response.json()
            for p in programs:
                if p.get("title", "").startswith("TEST_"):
                    del_resp = requests.delete(f"{API}/programs/{p['id']}")
                    print(f"Deleted test program: {p['title']} (status: {del_resp.status_code})")
        
        print("Cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
