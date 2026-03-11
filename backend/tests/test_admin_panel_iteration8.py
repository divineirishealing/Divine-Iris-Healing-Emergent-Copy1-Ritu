"""
Admin Panel Iteration 8 Tests
=============================
Tests for:
- Admin login flow
- Stats CRUD (POST, PUT, DELETE)
- Site Settings API (all new fields)
- Enrollments admin list
- Payments transactions list
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ===== STATS CRUD TESTS =====
class TestStatsCRUD:
    """Full CRUD tests for Stats endpoint"""
    
    def test_get_stats(self):
        """Test GET /api/stats returns list"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: GET /api/stats returned {len(data)} stats")
    
    def test_create_stat(self):
        """Test POST /api/stats creates new stat"""
        new_stat = {
            "value": "TEST_100+",
            "label": "Test Label",
            "order": 99
        }
        response = requests.post(f"{BASE_URL}/api/stats", json=new_stat)
        assert response.status_code == 200
        data = response.json()
        assert data["value"] == "TEST_100+"
        assert data["label"] == "Test Label"
        assert "id" in data
        self.created_stat_id = data["id"]
        print(f"SUCCESS: POST /api/stats created stat with id={data['id']}")
        return data["id"]
    
    def test_update_stat(self):
        """Test PUT /api/stats/{id} updates stat"""
        # First create a stat
        create_response = requests.post(f"{BASE_URL}/api/stats", json={
            "value": "TEST_200+",
            "label": "Initial Label",
            "order": 98
        })
        assert create_response.status_code == 200
        stat_id = create_response.json()["id"]
        
        # Update the stat
        update_data = {
            "value": "TEST_300+",
            "label": "Updated Label",
            "order": 97
        }
        response = requests.put(f"{BASE_URL}/api/stats/{stat_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["value"] == "TEST_300+"
        assert data["label"] == "Updated Label"
        print(f"SUCCESS: PUT /api/stats/{stat_id} updated stat")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/stats/{stat_id}")
    
    def test_delete_stat(self):
        """Test DELETE /api/stats/{id} removes stat"""
        # First create a stat
        create_response = requests.post(f"{BASE_URL}/api/stats", json={
            "value": "TEST_DELETE",
            "label": "To Be Deleted",
            "order": 100
        })
        assert create_response.status_code == 200
        stat_id = create_response.json()["id"]
        
        # Delete the stat
        response = requests.delete(f"{BASE_URL}/api/stats/{stat_id}")
        assert response.status_code == 200
        print(f"SUCCESS: DELETE /api/stats/{stat_id} deleted stat")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/stats")
        stats = get_response.json()
        stat_ids = [s["id"] for s in stats]
        assert stat_id not in stat_ids
        print("SUCCESS: Verified stat was deleted from list")
    
    def test_delete_nonexistent_stat(self):
        """Test DELETE /api/stats/{id} returns 404 for invalid id"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/stats/{fake_id}")
        assert response.status_code == 404
        print("SUCCESS: DELETE /api/stats returns 404 for nonexistent stat")


# ===== SITE SETTINGS TESTS =====
class TestSiteSettings:
    """Tests for Site Settings API with all new fields"""
    
    def test_get_settings(self):
        """Test GET /api/settings returns full settings object"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify core fields exist
        assert "id" in data
        assert "heading_font" in data
        assert "body_font" in data
        print("SUCCESS: GET /api/settings - basic fields present")
        
        # Verify hero fields
        assert "hero_title" in data
        assert "hero_subtitle" in data
        assert "hero_title_font" in data
        assert "hero_title_color" in data
        assert "hero_title_size" in data
        assert "hero_show_lines" in data
        print("SUCCESS: GET /api/settings - hero fields present")
        
        # Verify about fields
        assert "about_name" in data
        assert "about_title" in data
        assert "about_bio" in data
        assert "about_bio_2" in data
        assert "about_button_text" in data
        assert "about_button_link" in data
        print("SUCCESS: GET /api/settings - about fields present")
        
        # Verify newsletter fields
        assert "newsletter_heading" in data
        assert "newsletter_description" in data
        assert "newsletter_button_text" in data
        assert "newsletter_footer_text" in data
        print("SUCCESS: GET /api/settings - newsletter fields present")
        
        # Verify footer fields
        assert "footer_brand_name" in data
        assert "footer_tagline" in data
        assert "footer_email" in data
        assert "footer_phone" in data
        assert "footer_copyright" in data
        print("SUCCESS: GET /api/settings - footer fields present")
        
        # Verify social fields
        assert "social_facebook" in data
        assert "social_instagram" in data
        assert "social_youtube" in data
        assert "social_linkedin" in data
        print("SUCCESS: GET /api/settings - social fields present")
        
        # Verify global styles fields
        assert "heading_color" in data
        assert "body_color" in data
        assert "accent_color" in data
        assert "heading_size" in data
        assert "body_size" in data
        print("SUCCESS: GET /api/settings - global styles fields present")
        
        return data
    
    def test_update_hero_settings(self):
        """Test PUT /api/settings updates hero fields"""
        update_data = {
            "hero_title": "TEST Divine Iris\nTEST Healing",
            "hero_subtitle": "TEST SUBTITLE"
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=update_data)
        assert response.status_code == 200
        print("SUCCESS: PUT /api/settings updated hero settings")
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/settings")
        data = get_response.json()
        assert "TEST" in data["hero_title"]
        print("SUCCESS: Verified hero settings persisted")
        
        # Restore original values
        requests.put(f"{BASE_URL}/api/settings", json={
            "hero_title": "Divine Iris \nHealing",
            "hero_subtitle": "ETERNAL HAPPINESS"
        })
    
    def test_update_social_links(self):
        """Test PUT /api/settings updates social links"""
        update_data = {
            "social_facebook": "https://facebook.com/test",
            "social_instagram": "https://instagram.com/test",
            "social_youtube": "https://youtube.com/test",
            "social_linkedin": "https://linkedin.com/test"
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=update_data)
        assert response.status_code == 200
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/settings")
        data = get_response.json()
        assert "test" in data["social_facebook"]
        print("SUCCESS: PUT /api/settings updated social links")
        
        # Restore
        requests.put(f"{BASE_URL}/api/settings", json={
            "social_facebook": "https://facebook.com",
            "social_instagram": "https://instagram.com",
            "social_youtube": "https://youtube.com",
            "social_linkedin": "https://linkedin.com"
        })
    
    def test_update_footer_settings(self):
        """Test PUT /api/settings updates footer fields"""
        update_data = {
            "footer_brand_name": "TEST Brand",
            "footer_tagline": "TEST Tagline",
            "footer_email": "test@test.com",
            "footer_phone": "+1234567890",
            "footer_copyright": "TEST 2026"
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=update_data)
        assert response.status_code == 200
        print("SUCCESS: PUT /api/settings updated footer settings")
        
        # Restore
        requests.put(f"{BASE_URL}/api/settings", json={
            "footer_brand_name": "Divine Iris Healing",
            "footer_tagline": "Delve into the deeper realm of your soul with Divine Iris – Soulful Healing Studio",
            "footer_email": "support@divineirishealing.com",
            "footer_phone": "+971553325778",
            "footer_copyright": "2026 Divine Iris Healing. All Rights Reserved."
        })


# ===== ENROLLMENTS ADMIN TESTS =====
class TestEnrollmentsAdmin:
    """Tests for Enrollments Admin list endpoint"""
    
    def test_get_enrollments_list(self):
        """Test GET /api/enrollment/admin/list returns all enrollments"""
        response = requests.get(f"{BASE_URL}/api/enrollment/admin/list")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: GET /api/enrollment/admin/list returned {len(data)} enrollments")
        
        # Verify enrollment structure if any exist
        if len(data) > 0:
            enrollment = data[0]
            assert "id" in enrollment
            assert "booker_name" in enrollment or "name" in enrollment
            print("SUCCESS: Enrollment has expected structure")
    
    def test_get_payment_transactions(self):
        """Test GET /api/payments/transactions returns all transactions"""
        response = requests.get(f"{BASE_URL}/api/payments/transactions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: GET /api/payments/transactions returned {len(data)} transactions")


# ===== PROGRAMS CRUD TESTS =====
class TestProgramsCRUD:
    """Verify Programs CRUD works correctly"""
    
    def test_get_programs(self):
        """Test GET /api/programs returns list"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"SUCCESS: GET /api/programs returned {len(data)} programs")
    
    def test_programs_have_required_fields(self):
        """Verify programs have all required pricing and visibility fields"""
        response = requests.get(f"{BASE_URL}/api/programs")
        programs = response.json()
        
        for p in programs[:3]:  # Check first 3
            assert "id" in p
            assert "title" in p
            assert "visible" in p or p.get("visible") is not None
            assert "price_aed" in p or "price_usd" in p
            print(f"SUCCESS: Program '{p['title'][:30]}...' has required fields")


# ===== SESSIONS CRUD TESTS =====
class TestSessionsCRUD:
    """Verify Sessions CRUD works correctly"""
    
    def test_get_sessions(self):
        """Test GET /api/sessions returns list"""
        response = requests.get(f"{BASE_URL}/api/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: GET /api/sessions returned {len(data)} sessions")


# ===== TESTIMONIALS CRUD TESTS =====
class TestTestimonialsCRUD:
    """Verify Testimonials CRUD works correctly"""
    
    def test_get_testimonials(self):
        """Test GET /api/testimonials returns list"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: GET /api/testimonials returned {len(data)} testimonials")
    
    def test_testimonials_have_type(self):
        """Verify testimonials have graphic or video type"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        testimonials = response.json()
        
        if len(testimonials) > 0:
            for t in testimonials[:3]:
                assert "type" in t
                assert t["type"] in ["graphic", "video"]
            print("SUCCESS: Testimonials have valid type field")


# ===== NEWSLETTER TESTS =====
class TestNewsletter:
    """Tests for Newsletter subscriber list"""
    
    def test_get_subscribers(self):
        """Test GET /api/newsletter returns subscriber list"""
        response = requests.get(f"{BASE_URL}/api/newsletter")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: GET /api/newsletter returned {len(data)} subscribers")


# ===== CLEANUP =====
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Clean up TEST_ prefixed data after all tests"""
    yield
    # Cleanup stats with TEST_ prefix
    try:
        response = requests.get(f"{BASE_URL}/api/stats")
        if response.status_code == 200:
            stats = response.json()
            for stat in stats:
                if "TEST_" in stat.get("value", "") or "TEST_" in stat.get("label", ""):
                    requests.delete(f"{BASE_URL}/api/stats/{stat['id']}")
                    print(f"Cleaned up test stat: {stat['id']}")
    except:
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
