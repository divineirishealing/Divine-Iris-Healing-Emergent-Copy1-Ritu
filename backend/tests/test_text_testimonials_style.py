"""
Test Text Testimonials Style Feature
- Tests the text_testimonials_style field in site settings (PUT/GET)
- Tests text testimonials CRUD operations
- Tests that style changes persist correctly
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestTextTestimonialsStyle:
    """Test text testimonials style settings in site settings API"""
    
    def test_get_settings_returns_text_testimonials_style(self):
        """GET /api/settings should return text_testimonials_style field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        # The field should exist (may be None or a dict)
        assert "text_testimonials_style" in data
        print(f"Current text_testimonials_style: {data.get('text_testimonials_style')}")
    
    def test_update_text_testimonials_style(self):
        """PUT /api/settings should correctly save text_testimonials_style"""
        test_style = {
            "quote_font": "Cinzel",
            "quote_size": "24px",
            "quote_color": "#4a3f35",
            "quote_italic": True,
            "author_font": "Lato",
            "author_size": "11px",
            "author_color": "#6b5e50"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={"text_testimonials_style": test_style}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response contains the updated style
        assert data.get("text_testimonials_style") == test_style
        print(f"Updated text_testimonials_style: {data.get('text_testimonials_style')}")
    
    def test_style_persists_after_update(self):
        """Style should persist after updating"""
        # First, set a specific style
        test_style = {
            "quote_font": "Playfair Display",
            "quote_size": "28px",
            "quote_color": "#2d3748",
            "quote_italic": False,
            "author_font": "Montserrat",
            "author_size": "13px",
            "author_color": "#718096"
        }
        
        put_response = requests.put(
            f"{BASE_URL}/api/settings",
            json={"text_testimonials_style": test_style}
        )
        assert put_response.status_code == 200
        
        # Now verify it persists via GET
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        
        assert data.get("text_testimonials_style") == test_style
        print("Style correctly persists after update")
    
    def test_style_with_different_fonts(self):
        """Test various font combinations"""
        fonts_to_test = [
            {"quote_font": "Dancing Script", "author_font": "Josefin Sans"},
            {"quote_font": "Great Vibes", "author_font": "Poppins"},
            {"quote_font": "Cormorant Garamond", "author_font": "Raleway"},
        ]
        
        for fonts in fonts_to_test:
            response = requests.put(
                f"{BASE_URL}/api/settings",
                json={"text_testimonials_style": fonts}
            )
            assert response.status_code == 200
            data = response.json()
            style = data.get("text_testimonials_style")
            assert style.get("quote_font") == fonts["quote_font"]
            assert style.get("author_font") == fonts["author_font"]
            print(f"Font combination {fonts} saved successfully")


class TestTextTestimonialsAPI:
    """Test text testimonials CRUD operations"""
    
    def test_list_testimonials(self):
        """GET /api/text-testimonials/ should return list of testimonials"""
        response = requests.get(f"{BASE_URL}/api/text-testimonials/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} testimonials")
        if len(data) > 0:
            # Verify structure
            first = data[0]
            assert "id" in first
            assert "quote" in first
            assert "author" in first
            assert "visible" in first
    
    def test_list_visible_testimonials(self):
        """GET /api/text-testimonials/visible should return only visible testimonials"""
        response = requests.get(f"{BASE_URL}/api/text-testimonials/visible")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All should be visible
        for item in data:
            assert item.get("visible") == True
        print(f"Found {len(data)} visible testimonials")
    
    def test_create_testimonial(self):
        """POST /api/text-testimonials/ should create new testimonial"""
        test_testimonial = {
            "quote": "TEST_This is a test quote for automated testing.",
            "author": "TEST_User",
            "role": "Test Location",
            "visible": True,
            "order": 99
        }
        
        response = requests.post(
            f"{BASE_URL}/api/text-testimonials/",
            json=test_testimonial
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data.get("quote") == test_testimonial["quote"]
        assert data.get("author") == test_testimonial["author"]
        assert data.get("role") == test_testimonial["role"]
        print(f"Created testimonial with id: {data.get('id')}")
        
        # Store ID for cleanup
        self.__class__.test_testimonial_id = data.get("id")
    
    def test_update_testimonial(self):
        """PUT /api/text-testimonials/{id} should update testimonial"""
        # Create first if not exists
        if not hasattr(self.__class__, 'test_testimonial_id'):
            self.test_create_testimonial()
        
        tid = self.__class__.test_testimonial_id
        updated_data = {
            "quote": "TEST_Updated quote text for testing",
            "author": "TEST_Updated Author",
            "role": "Updated Location",
            "visible": True,
            "order": 98
        }
        
        response = requests.put(
            f"{BASE_URL}/api/text-testimonials/{tid}",
            json=updated_data
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("quote") == updated_data["quote"]
        assert data.get("author") == updated_data["author"]
        print(f"Updated testimonial {tid}")
    
    def test_delete_testimonial(self):
        """DELETE /api/text-testimonials/{id} should remove testimonial"""
        # Create first if not exists
        if not hasattr(self.__class__, 'test_testimonial_id'):
            self.test_create_testimonial()
        
        tid = self.__class__.test_testimonial_id
        
        response = requests.delete(f"{BASE_URL}/api/text-testimonials/{tid}")
        assert response.status_code == 200
        
        # Verify it's gone
        all_response = requests.get(f"{BASE_URL}/api/text-testimonials/")
        all_data = all_response.json()
        ids = [t.get("id") for t in all_data]
        assert tid not in ids
        print(f"Deleted testimonial {tid}")


class TestIntegration:
    """Integration tests for text testimonials with styles"""
    
    def test_full_workflow(self):
        """Test complete workflow: set style, create testimonial, verify visible endpoint"""
        # 1. Set a style
        style = {
            "quote_font": "Merriweather",
            "quote_size": "22px",
            "quote_color": "#3d2e1e",
            "quote_italic": True,
            "author_font": "Open Sans",
            "author_size": "12px",
            "author_color": "#5a4a3e"
        }
        
        put_resp = requests.put(f"{BASE_URL}/api/settings", json={"text_testimonials_style": style})
        assert put_resp.status_code == 200
        print("1. Style set successfully")
        
        # 2. Create a testimonial
        testimonial = {
            "quote": "TEST_INTEGRATION_This is an integration test quote",
            "author": "TEST_INTEGRATION_Author",
            "role": "Test Integration",
            "visible": True,
            "order": 100
        }
        
        create_resp = requests.post(f"{BASE_URL}/api/text-testimonials/", json=testimonial)
        assert create_resp.status_code == 200
        tid = create_resp.json().get("id")
        print(f"2. Testimonial created: {tid}")
        
        # 3. Verify visible endpoint includes it
        visible_resp = requests.get(f"{BASE_URL}/api/text-testimonials/visible")
        assert visible_resp.status_code == 200
        visible_data = visible_resp.json()
        visible_ids = [t.get("id") for t in visible_data]
        assert tid in visible_ids
        print("3. Testimonial appears in visible list")
        
        # 4. Verify settings endpoint returns the style
        settings_resp = requests.get(f"{BASE_URL}/api/settings")
        assert settings_resp.status_code == 200
        settings_data = settings_resp.json()
        assert settings_data.get("text_testimonials_style") == style
        print("4. Style confirmed in settings")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/text-testimonials/{tid}")
        print("5. Cleanup complete")


# Cleanup any TEST_ prefixed data after all tests
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
    yield
    # Cleanup TEST_ testimonials
    response = requests.get(f"{BASE_URL}/api/text-testimonials/")
    if response.status_code == 200:
        for t in response.json():
            if t.get("quote", "").startswith("TEST_") or t.get("author", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/text-testimonials/{t['id']}")
    print("Cleaned up TEST_ testimonials")
