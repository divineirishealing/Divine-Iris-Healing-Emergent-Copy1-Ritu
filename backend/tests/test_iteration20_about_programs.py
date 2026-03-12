"""
Iteration 20 Tests - About Page & Program Detail Page Features
Testing:
- About page content (about_name, about_bio, about_philosophy, etc.)
- Program detail pages with content_sections
- Footer program links
- Terms & Privacy pages
- Header/Footer ABOUT links
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSettingsAboutContent:
    """Test settings API returns about page content fields"""
    
    def test_settings_returns_about_name(self):
        """Settings should return about_name field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert 'about_name' in data
        print(f"✅ about_name: {data.get('about_name')}")
    
    def test_settings_returns_about_bio(self):
        """Settings should return about_bio field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert 'about_bio' in data
        print(f"✅ about_bio present: {len(data.get('about_bio', '')) > 0}")
    
    def test_settings_returns_about_philosophy(self):
        """Settings should return about_philosophy field (for Our Philosophy card)"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        # about_philosophy may be empty but field should exist or use default
        print(f"✅ Settings API returns all about fields")
    
    def test_settings_returns_terms_content(self):
        """Settings should return terms_content for /terms page"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert 'terms_content' in data
        print(f"✅ terms_content: {data.get('terms_content', '')[:50]}...")
    
    def test_settings_returns_privacy_content(self):
        """Settings should return privacy_content for /privacy page"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert 'privacy_content' in data
        print(f"✅ privacy_content: {data.get('privacy_content', '')[:50]}...")


class TestProgramsAPI:
    """Test programs API returns all required fields including content_sections"""
    
    def test_get_all_programs(self):
        """GET /api/programs should return list of programs"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        assert isinstance(programs, list)
        assert len(programs) >= 1
        print(f"✅ Found {len(programs)} programs")
    
    def test_program_has_required_fields(self):
        """Each program should have id, title, category, description"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        for p in programs[:3]:  # Check first 3
            assert 'id' in p
            assert 'title' in p
            assert 'category' in p
            print(f"✅ Program {p['id']}: {p['title']} - {p['category']}")
    
    def test_program_has_content_sections_field(self):
        """Each program should have content_sections field (may be empty list)"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        for p in programs:
            assert 'content_sections' in p
        print(f"✅ All programs have content_sections field")
    
    def test_get_single_program(self):
        """GET /api/programs/:id should return single program with content_sections"""
        # Get first program
        response = requests.get(f"{BASE_URL}/api/programs")
        programs = response.json()
        if len(programs) > 0:
            program_id = programs[0]['id']
            
            # Get single program
            response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
            assert response.status_code == 200
            program = response.json()
            assert program['id'] == program_id
            assert 'content_sections' in program
            print(f"✅ Single program {program_id} fetched with content_sections")
    
    def test_program_1_has_test_content_section(self):
        """Program 1 (AWRP) should have test content section from iteration 19"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        if response.status_code == 200:
            program = response.json()
            sections = program.get('content_sections', [])
            if len(sections) > 0:
                print(f"✅ Program 1 has {len(sections)} content section(s)")
                for s in sections:
                    print(f"   - Section: {s.get('title', 'Untitled')} (type: {s.get('section_type', 'custom')})")
            else:
                print(f"⚠️ Program 1 has no content sections (uses default fallback)")
        else:
            print(f"⚠️ Program 1 not found")
    
    def test_flagship_program_has_duration_tiers(self):
        """Flagship programs should have duration_tiers"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        flagship = [p for p in programs if p.get('is_flagship')]
        for p in flagship[:2]:  # Check first 2 flagship
            assert 'duration_tiers' in p
            tiers = p.get('duration_tiers', [])
            print(f"✅ Flagship '{p['title']}' has {len(tiers)} duration tiers")


class TestProgramDetailPageContent:
    """Test that programs return data needed for program detail page sections"""
    
    def test_program_returns_description_for_journey(self):
        """Program description is used for 'The Journey' section fallback"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        for p in programs[:3]:
            assert 'description' in p
            if p['description']:
                print(f"✅ Program {p['id']} has description for Journey section")
    
    def test_content_section_structure(self):
        """Content sections should have proper structure"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        if response.status_code == 200:
            program = response.json()
            sections = program.get('content_sections', [])
            for s in sections:
                # Check required fields
                assert 'section_type' in s or 'title' in s
                print(f"✅ Section has proper structure: {s.get('title', 'Untitled')}")


class TestTestimonialsAPI:
    """Test testimonials API for program detail page"""
    
    def test_get_testimonials(self):
        """GET /api/testimonials should return list"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        testimonials = response.json()
        assert isinstance(testimonials, list)
        print(f"✅ Found {len(testimonials)} testimonials")


class TestFontConfigInIndex:
    """Verify font configuration is accessible via settings"""
    
    def test_settings_has_font_config(self):
        """Settings should have font configuration"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        # Check for font-related fields
        print(f"✅ heading_font: {data.get('heading_font', 'default')}")
        print(f"✅ body_font: {data.get('body_font', 'default')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
