"""
Iteration 31: Testing Section Template System
- GET /api/settings returns program_section_template with 4 default sections
- PUT /api/settings can update program_section_template
- Programs API returns programs with flagship/enrollment_open flags
- Flagship programs: IDs 1, 2, 5 should show Know More button
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSectionTemplateAPI:
    """Test program_section_template field in settings API"""
    
    def test_get_settings_returns_section_template(self):
        """GET /api/settings should return program_section_template with 4 default sections"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "program_section_template" in data
        
        template = data["program_section_template"]
        assert isinstance(template, list)
        assert len(template) == 4, f"Expected 4 sections, got {len(template)}"
        
        # Check default section types
        section_types = [s["section_type"] for s in template]
        assert "journey" in section_types
        assert "who_for" in section_types
        assert "experience" in section_types
        assert "why_now" in section_types
        
        print("PASS: GET /api/settings returns program_section_template with 4 default sections")
    
    def test_section_template_default_values(self):
        """Verify default section template has correct structure"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        template = response.json()["program_section_template"]
        
        # Check journey section
        journey = next((s for s in template if s["section_type"] == "journey"), None)
        assert journey is not None
        assert journey["default_title"] == "The Journey"
        assert journey["order"] == 0
        assert journey["is_enabled"] == True
        
        # Check who_for section
        who_for = next((s for s in template if s["section_type"] == "who_for"), None)
        assert who_for is not None
        assert who_for["default_title"] == "Who It Is For?"
        assert who_for["order"] == 1
        
        # Check experience section (dark BG)
        experience = next((s for s in template if s["section_type"] == "experience"), None)
        assert experience is not None
        assert experience["default_title"] == "Your Experience"
        assert experience["order"] == 2
        
        # Check why_now section
        why_now = next((s for s in template if s["section_type"] == "why_now"), None)
        assert why_now is not None
        assert why_now["default_title"] == "Why You Need This Now?"
        assert why_now["order"] == 3
        
        print("PASS: Section template default values are correct")

    def test_update_section_template(self):
        """PUT /api/settings should be able to update program_section_template"""
        # Get current settings first
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        original_template = get_response.json()["program_section_template"]
        
        # Add a new custom section
        modified_template = original_template.copy()
        custom_section = {
            "id": "test_custom_section",
            "section_type": "custom",
            "default_title": "Test Custom Section",
            "default_subtitle": "Test subtitle",
            "order": 4,
            "is_enabled": True
        }
        modified_template.append(custom_section)
        
        # Update settings
        update_response = requests.put(f"{BASE_URL}/api/settings", json={
            "program_section_template": modified_template
        })
        assert update_response.status_code == 200
        
        # Verify update
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        updated_template = verify_response.json()["program_section_template"]
        assert len(updated_template) == 5
        
        custom = next((s for s in updated_template if s["id"] == "test_custom_section"), None)
        assert custom is not None
        assert custom["default_title"] == "Test Custom Section"
        
        # Cleanup - restore original template
        restore_response = requests.put(f"{BASE_URL}/api/settings", json={
            "program_section_template": original_template
        })
        assert restore_response.status_code == 200
        
        print("PASS: PUT /api/settings can update program_section_template")


class TestProgramsAPI:
    """Test programs API for flagship and enrollment_open flags"""
    
    def test_get_programs_list(self):
        """GET /api/programs should return list with is_flagship and enrollment_open"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        assert isinstance(programs, list)
        assert len(programs) > 0
        
        # Check flagship programs exist
        flagship_ids = [p["id"] for p in programs if p.get("is_flagship")]
        assert "1" in flagship_ids, "AWRP (ID 1) should be flagship"
        assert "2" in flagship_ids, "AMRP (ID 2) should be flagship"
        assert "5" in flagship_ids, "Quad Layer (ID 5) should be flagship"
        
        print(f"PASS: Found {len(flagship_ids)} flagship programs: {flagship_ids}")
    
    def test_flagship_program_1_awrp(self):
        """GET /api/programs/1 should return AWRP with is_flagship=true"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        
        program = response.json()
        assert program["is_flagship"] == True
        assert program["enrollment_open"] == True
        assert "content_sections" in program
        
        print(f"PASS: Program 1 (AWRP) is_flagship={program['is_flagship']}, enrollment_open={program['enrollment_open']}")
    
    def test_flagship_program_2_amrp(self):
        """GET /api/programs/2 should return AMRP with is_flagship=true"""
        response = requests.get(f"{BASE_URL}/api/programs/2")
        assert response.status_code == 200
        
        program = response.json()
        assert program["is_flagship"] == True
        assert program["enrollment_open"] == True
        
        print(f"PASS: Program 2 (AMRP) is_flagship={program['is_flagship']}")
    
    def test_flagship_program_5_quad_layer(self):
        """GET /api/programs/5 should return Quad Layer with is_flagship=true"""
        response = requests.get(f"{BASE_URL}/api/programs/5")
        assert response.status_code == 200
        
        program = response.json()
        assert program["is_flagship"] == True
        
        print(f"PASS: Program 5 (Quad Layer) is_flagship={program['is_flagship']}")
    
    def test_non_flagship_program_3_soulsync(self):
        """GET /api/programs/3 should return SoulSync with enrollment_open=false"""
        response = requests.get(f"{BASE_URL}/api/programs/3")
        assert response.status_code == 200
        
        program = response.json()
        assert program["is_flagship"] == False
        assert program["enrollment_open"] == False
        
        print(f"PASS: Program 3 (SoulSync) is_flagship={program['is_flagship']}, enrollment_open={program['enrollment_open']}")


class TestProgramContentSections:
    """Test that programs can have content_sections for per-program text"""
    
    def test_program_has_content_sections_field(self):
        """Programs should have content_sections field for per-program text content"""
        response = requests.get(f"{BASE_URL}/api/programs/1")
        assert response.status_code == 200
        
        program = response.json()
        assert "content_sections" in program
        assert isinstance(program["content_sections"], list)
        
        print(f"PASS: Program 1 has content_sections field with {len(program['content_sections'])} sections")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
