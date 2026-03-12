"""
Iteration 30 - Program Detail Page Template Testing
Tests for:
1. API GET /api/settings returns page_heroes.program_template with saved styles
2. Admin Panel: Page Headers tab shows 'FLAGSHIP PROGRAM PAGES — SHARED TEMPLATE' section
3. PUT /api/settings updates program_template correctly
4. Static page headers still work correctly
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProgramTemplate:
    """Tests for unified program template feature"""
    
    def test_settings_contains_program_template(self):
        """GET /api/settings should return page_heroes.program_template"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'page_heroes' in data, "page_heroes missing from settings"
        
        page_heroes = data['page_heroes']
        assert 'program_template' in page_heroes, "program_template missing from page_heroes"
        
        template = page_heroes['program_template']
        print(f"program_template found: {template}")
        
    def test_program_template_has_style_keys(self):
        """program_template should have all required style keys"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        template = response.json().get('page_heroes', {}).get('program_template', {})
        
        # Required style keys according to PageHeadersTab.jsx TEMPLATE_STYLE_KEYS
        required_keys = ['title_style', 'subtitle_style', 'section_title_style', 
                        'section_subtitle_style', 'body_style', 'cta_style']
        
        for key in required_keys:
            assert key in template, f"Missing required style key: {key}"
            print(f"✓ {key} present")
            
        # Also check color fields
        assert 'hero_bg' in template, "Missing hero_bg color"
        assert 'accent_color' in template, "Missing accent_color"
        print(f"✓ hero_bg: {template.get('hero_bg')}")
        print(f"✓ accent_color: {template.get('accent_color')}")

    def test_program_template_styles_have_values(self):
        """Template style objects should have actual style values"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        template = response.json().get('page_heroes', {}).get('program_template', {})
        
        # Check title_style has values
        title_style = template.get('title_style', {})
        assert title_style, "title_style should not be empty"
        assert 'font_color' in title_style or 'font_family' in title_style, \
            "title_style should have some font properties"
        print(f"✓ title_style: {title_style}")
        
        # Check subtitle_style has values  
        subtitle_style = template.get('subtitle_style', {})
        assert subtitle_style, "subtitle_style should not be empty"
        print(f"✓ subtitle_style: {subtitle_style}")

    def test_update_program_template(self):
        """PUT /api/settings should update program_template correctly"""
        # Get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        current = get_response.json()
        
        # Create modified template
        new_template = {
            **current.get('page_heroes', {}).get('program_template', {}),
            'title_style': {
                'font_color': '#TEST123',
                'font_family': "'Cinzel', serif",
                'font_size': '52px',
                'font_weight': 'bold'
            },
            'hero_bg': '#2a2a2a',
            'accent_color': '#E4BF47'
        }
        
        # Update settings
        update_payload = {
            **current,
            'page_heroes': {
                **current.get('page_heroes', {}),
                'program_template': new_template
            }
        }
        
        put_response = requests.put(f"{BASE_URL}/api/settings", json=update_payload)
        assert put_response.status_code == 200, f"Update failed: {put_response.text}"
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        assert verify_response.status_code == 200
        
        verified_template = verify_response.json().get('page_heroes', {}).get('program_template', {})
        assert verified_template.get('title_style', {}).get('font_color') == '#TEST123', \
            "font_color did not persist"
        assert verified_template.get('hero_bg') == '#2a2a2a', "hero_bg did not persist"
        assert verified_template.get('accent_color') == '#E4BF47', "accent_color did not persist"
        
        print(f"✓ Template update persisted correctly")
        
        # Restore original values
        restore_payload = {
            **current,
            'page_heroes': {
                **current.get('page_heroes', {}),
                'program_template': {
                    **new_template,
                    'title_style': {
                        'font_color': '#ffffff',
                        'font_family': "'Cinzel', serif",
                        'font_size': '48px',
                        'font_weight': 'bold'
                    },
                    'hero_bg': '#1a1a1a',
                    'accent_color': '#D4AF37'
                }
            }
        }
        requests.put(f"{BASE_URL}/api/settings", json=restore_payload)

    def test_static_page_headers_still_exist(self):
        """Static page headers should still work correctly"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        page_heroes = response.json().get('page_heroes', {})
        
        # Required static pages from PageHeadersTab.jsx STATIC_PAGES
        static_pages = ['home', 'services', 'contact', 'about', 'programs', 
                       'sponsor', 'transformations', 'media', 'blog', 'sessions']
        
        for page in static_pages:
            assert page in page_heroes, f"Static page '{page}' missing from page_heroes"
            print(f"✓ {page} exists in page_heroes")


class TestProgramDetailEndpoints:
    """Tests for program detail page data"""
    
    def test_get_program_2_amrp(self):
        """GET /api/programs/2 should return AMRP (flagship)"""
        response = requests.get(f"{BASE_URL}/api/programs/2")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get('title'), "Program should have title"
        assert data.get('is_flagship') == True, "AMRP should be a flagship program"
        print(f"✓ Program 2: {data.get('title')}, is_flagship={data.get('is_flagship')}")
        
    def test_get_program_1_awrp(self):
        """GET /api/programs/1 should return AWRP (flagship)"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('is_flagship') == True, "AWRP should be a flagship program"
        print(f"✓ Program 1: {data.get('title')}, is_flagship={data.get('is_flagship')}")
        
    def test_get_program_5_quad_layer(self):
        """GET /api/programs/5 should return Quad Layer Healing (flagship)"""
        response = requests.get(f"{BASE_URL}/api/programs/5")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('is_flagship') == True, "Quad Layer Healing should be a flagship program"
        print(f"✓ Program 5: {data.get('title')}, is_flagship={data.get('is_flagship')}")

    def test_programs_list_contains_flagship(self):
        """GET /api/programs should contain flagship programs"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        flagship_count = sum(1 for p in programs if p.get('is_flagship'))
        
        assert flagship_count >= 3, f"Expected at least 3 flagship programs, found {flagship_count}"
        print(f"✓ Found {flagship_count} flagship programs")


# Note: Admin authentication is handled client-side (no API endpoint for login)
