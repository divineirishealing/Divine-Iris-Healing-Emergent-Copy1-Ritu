"""
Iteration 58: Testing Inbox Feature
- GET /api/inbox/counts - returns correct counts for contacts, interests, questions
- GET /api/inbox/contacts - returns all contact form submissions from quote_requests collection
- GET /api/inbox/interests - returns all express-your-interest entries from notify_me collection
- GET /api/inbox/questions - returns all questions from session_questions collection
- PUT /api/inbox/contacts/{id}/status - updates status to 'read'
- DELETE /api/inbox/contacts/{id} - deletes a contact submission
- POST /api/inbox/reply/{collection}/{item_id} - sends reply email and updates status
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestInboxCounts:
    """Test GET /api/inbox/counts endpoint"""

    def test_get_counts_returns_200(self):
        """Verify counts endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/inbox/counts")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/inbox/counts returns 200")

    def test_counts_has_required_fields(self):
        """Verify counts response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/inbox/counts")
        data = response.json()
        required_fields = ['contacts_new', 'contacts_total', 'interests_total', 'questions_new', 'questions_total', 'total_new']
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        print(f"✓ Counts response has all required fields: {required_fields}")
        print(f"  Counts data: {data}")


class TestInboxContacts:
    """Test GET /api/inbox/contacts endpoint"""

    def test_get_contacts_returns_200(self):
        """Verify contacts endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/inbox/contacts")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/inbox/contacts returns 200")

    def test_contacts_returns_list(self):
        """Verify contacts returns a list"""
        response = requests.get(f"{BASE_URL}/api/inbox/contacts")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Contacts returns a list with {len(data)} items")

    def test_contacts_filter_by_status(self):
        """Test filtering contacts by status"""
        response = requests.get(f"{BASE_URL}/api/inbox/contacts?status=new")
        assert response.status_code == 200
        print(f"✓ GET /api/inbox/contacts?status=new returns 200")


class TestInboxInterests:
    """Test GET /api/inbox/interests endpoint"""

    def test_get_interests_returns_200(self):
        """Verify interests endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/inbox/interests")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/inbox/interests returns 200")

    def test_interests_returns_list(self):
        """Verify interests returns a list"""
        response = requests.get(f"{BASE_URL}/api/inbox/interests")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Interests returns a list with {len(data)} items")


class TestInboxQuestions:
    """Test GET /api/inbox/questions endpoint"""

    def test_get_questions_returns_200(self):
        """Verify questions endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/inbox/questions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/inbox/questions returns 200")

    def test_questions_returns_list(self):
        """Verify questions returns a list"""
        response = requests.get(f"{BASE_URL}/api/inbox/questions")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Questions returns a list with {len(data)} items")

    def test_questions_filter_by_status(self):
        """Test filtering questions by status=new"""
        response = requests.get(f"{BASE_URL}/api/inbox/questions?status=new")
        assert response.status_code == 200
        print(f"✓ GET /api/inbox/questions?status=new returns 200")


class TestInboxStatusUpdate:
    """Test PUT /api/inbox/{collection}/{id}/status endpoint"""

    def test_update_contact_status(self):
        """Test updating contact status to read - first get a contact"""
        contacts_response = requests.get(f"{BASE_URL}/api/inbox/contacts")
        contacts = contacts_response.json()
        
        if len(contacts) > 0:
            contact_id = contacts[0].get('id')
            if contact_id:
                response = requests.put(
                    f"{BASE_URL}/api/inbox/contacts/{contact_id}/status",
                    json={"status": "read"}
                )
                assert response.status_code == 200, f"Expected 200, got {response.status_code}"
                print(f"✓ PUT /api/inbox/contacts/{contact_id}/status returns 200")
            else:
                print("⚠ First contact has no 'id' field")
        else:
            pytest.skip("No contacts available to test status update")

    def test_update_nonexistent_contact_status(self):
        """Test updating status of non-existent contact returns 404"""
        fake_id = "nonexistent-" + str(uuid.uuid4())
        response = requests.put(
            f"{BASE_URL}/api/inbox/contacts/{fake_id}/status",
            json={"status": "read"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ PUT /api/inbox/contacts/{fake_id}/status returns 404 for non-existent")

    def test_update_interest_status(self):
        """Test updating interest status"""
        interests_response = requests.get(f"{BASE_URL}/api/inbox/interests")
        interests = interests_response.json()
        
        if len(interests) > 0:
            interest_id = interests[0].get('id')
            if interest_id:
                response = requests.put(
                    f"{BASE_URL}/api/inbox/interests/{interest_id}/status",
                    json={"status": "read"}
                )
                assert response.status_code == 200, f"Expected 200, got {response.status_code}"
                print(f"✓ PUT /api/inbox/interests/{interest_id}/status returns 200")
            else:
                print("⚠ First interest has no 'id' field")
        else:
            pytest.skip("No interests available to test status update")


class TestInboxDelete:
    """Test DELETE /api/inbox/{collection}/{id} endpoint"""

    def test_delete_nonexistent_contact(self):
        """Test deleting non-existent contact returns 404"""
        fake_id = "nonexistent-" + str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/inbox/contacts/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ DELETE /api/inbox/contacts/{fake_id} returns 404 for non-existent")

    def test_delete_nonexistent_interest(self):
        """Test deleting non-existent interest returns 404"""
        fake_id = "nonexistent-" + str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/inbox/interests/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ DELETE /api/inbox/interests/{fake_id} returns 404 for non-existent")


class TestInboxReply:
    """Test POST /api/inbox/reply/{collection}/{item_id} endpoint"""

    def test_reply_invalid_collection(self):
        """Test reply to invalid collection returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/inbox/reply/invalid/some-id",
            json={"message": "Test reply"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ POST /api/inbox/reply/invalid/some-id returns 400")

    def test_reply_nonexistent_item(self):
        """Test reply to non-existent item returns 404"""
        fake_id = "nonexistent-" + str(uuid.uuid4())
        response = requests.post(
            f"{BASE_URL}/api/inbox/reply/contacts/{fake_id}",
            json={"message": "Test reply"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ POST /api/inbox/reply/contacts/{fake_id} returns 404")

    def test_reply_endpoint_exists(self):
        """Test that reply endpoint exists and accepts valid request body"""
        contacts_response = requests.get(f"{BASE_URL}/api/inbox/contacts")
        contacts = contacts_response.json()
        
        if len(contacts) > 0:
            contact = contacts[0]
            contact_id = contact.get('id')
            email = contact.get('email')
            
            if contact_id and email:
                # Test the reply endpoint (won't actually send email in test)
                response = requests.post(
                    f"{BASE_URL}/api/inbox/reply/contacts/{contact_id}",
                    json={
                        "message": "Thank you for reaching out! This is a test reply.",
                        "include_programs": False,
                        "program_ids": [],
                        "include_whatsapp": False,
                        "whatsapp_link": "",
                        "include_workshop_updates": False,
                        "include_social_links": True
                    }
                )
                # Should return 200 (email may or may not send depending on SMTP config)
                assert response.status_code == 200, f"Expected 200, got {response.status_code}"
                data = response.json()
                assert "message" in data, "Response should have 'message' field"
                print(f"✓ POST /api/inbox/reply/contacts/{contact_id} returns 200")
                print(f"  Response: {data}")
            else:
                print(f"⚠ Contact missing id or email - skipping reply test")
                pytest.skip("Contact missing required fields")
        else:
            pytest.skip("No contacts available to test reply")


class TestInboxDataIntegrity:
    """Test data consistency between counts and actual items"""

    def test_contacts_count_matches_items(self):
        """Verify contacts_total matches actual contacts count"""
        counts_response = requests.get(f"{BASE_URL}/api/inbox/counts")
        contacts_response = requests.get(f"{BASE_URL}/api/inbox/contacts")
        
        counts = counts_response.json()
        contacts = contacts_response.json()
        
        assert counts['contacts_total'] == len(contacts), \
            f"contacts_total ({counts['contacts_total']}) != actual contacts ({len(contacts)})"
        print(f"✓ contacts_total ({counts['contacts_total']}) matches actual contacts count")

    def test_interests_count_matches_items(self):
        """Verify interests_total matches actual interests count"""
        counts_response = requests.get(f"{BASE_URL}/api/inbox/counts")
        interests_response = requests.get(f"{BASE_URL}/api/inbox/interests")
        
        counts = counts_response.json()
        interests = interests_response.json()
        
        assert counts['interests_total'] == len(interests), \
            f"interests_total ({counts['interests_total']}) != actual interests ({len(interests)})"
        print(f"✓ interests_total ({counts['interests_total']}) matches actual interests count")

    def test_questions_count_matches_items(self):
        """Verify questions_total matches actual questions count"""
        counts_response = requests.get(f"{BASE_URL}/api/inbox/counts")
        questions_response = requests.get(f"{BASE_URL}/api/inbox/questions")
        
        counts = counts_response.json()
        questions = questions_response.json()
        
        assert counts['questions_total'] == len(questions), \
            f"questions_total ({counts['questions_total']}) != actual questions ({len(questions)})"
        print(f"✓ questions_total ({counts['questions_total']}) matches actual questions count")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
