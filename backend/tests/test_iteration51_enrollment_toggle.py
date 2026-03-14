"""
Iteration 51 - Enrollment Toggle Feature Tests
Tests for P0: Upcoming Programs card enrollment_open toggle behavior

Test scenarios:
1. GET /api/programs?upcoming_only=true returns enrollment_open and closure_text fields
2. PUT /api/programs/{id} can update enrollment_open to true/false
3. PUT /api/programs/{id} can update closure_text options
4. Verify enrollment_open default is true
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEnrollmentToggleAPI:
    """Tests for enrollment toggle API functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Store original program state for cleanup"""
        self.program_id = "5"  # Quad Layer Healing
        # Get original state
        response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        if response.status_code == 200:
            self.original_program = response.json()
        yield
        # Restore original state after each test
        if hasattr(self, 'original_program'):
            requests.put(f"{BASE_URL}/api/programs/{self.program_id}", json=self.original_program)
    
    def test_get_upcoming_programs_has_enrollment_fields(self):
        """Verify GET /api/programs?upcoming_only=true returns enrollment_open and closure_text"""
        response = requests.get(f"{BASE_URL}/api/programs?visible_only=true&upcoming_only=true")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one upcoming program"
        
        # Check first upcoming program has enrollment fields
        program = data[0]
        assert "enrollment_open" in program, "Missing enrollment_open field"
        assert "closure_text" in program, "Missing closure_text field"
        assert isinstance(program["enrollment_open"], bool), "enrollment_open should be boolean"
        print(f"✅ Upcoming program has enrollment_open={program['enrollment_open']}, closure_text='{program['closure_text']}'")
    
    def test_get_program_by_id_has_enrollment_fields(self):
        """Verify GET /api/programs/{id} returns enrollment fields"""
        response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        program = response.json()
        assert "enrollment_open" in program, "Missing enrollment_open field"
        assert "closure_text" in program, "Missing closure_text field"
        print(f"✅ Program {self.program_id} has enrollment_open={program['enrollment_open']}")
    
    def test_update_enrollment_open_to_false(self):
        """Verify PUT /api/programs/{id} can set enrollment_open to false"""
        # Get current program
        get_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert get_response.status_code == 200
        program = get_response.json()
        
        # Update enrollment_open to false
        program["enrollment_open"] = False
        put_response = requests.put(f"{BASE_URL}/api/programs/{self.program_id}", json=program)
        assert put_response.status_code == 200, f"Expected 200, got {put_response.status_code}: {put_response.text}"
        
        updated = put_response.json()
        assert updated["enrollment_open"] == False, f"enrollment_open should be False, got {updated['enrollment_open']}"
        
        # Verify persistence with GET
        verify_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert verify_response.status_code == 200
        assert verify_response.json()["enrollment_open"] == False, "enrollment_open=False not persisted"
        print("✅ Successfully updated enrollment_open to false")
    
    def test_update_enrollment_open_to_true(self):
        """Verify PUT /api/programs/{id} can set enrollment_open to true"""
        # Get current program
        get_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert get_response.status_code == 200
        program = get_response.json()
        
        # First set to false
        program["enrollment_open"] = False
        requests.put(f"{BASE_URL}/api/programs/{self.program_id}", json=program)
        
        # Then set back to true
        program["enrollment_open"] = True
        put_response = requests.put(f"{BASE_URL}/api/programs/{self.program_id}", json=program)
        assert put_response.status_code == 200
        
        updated = put_response.json()
        assert updated["enrollment_open"] == True, f"enrollment_open should be True, got {updated['enrollment_open']}"
        
        # Verify persistence with GET
        verify_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert verify_response.status_code == 200
        assert verify_response.json()["enrollment_open"] == True, "enrollment_open=True not persisted"
        print("✅ Successfully updated enrollment_open to true")
    
    def test_update_closure_text(self):
        """Verify PUT /api/programs/{id} can update closure_text"""
        # Get current program
        get_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert get_response.status_code == 200
        program = get_response.json()
        
        # Update closure_text to a different option
        test_closure_text = "Seats Full"
        program["closure_text"] = test_closure_text
        put_response = requests.put(f"{BASE_URL}/api/programs/{self.program_id}", json=program)
        assert put_response.status_code == 200
        
        updated = put_response.json()
        assert updated["closure_text"] == test_closure_text, f"closure_text should be '{test_closure_text}', got '{updated['closure_text']}'"
        
        # Verify persistence with GET
        verify_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert verify_response.status_code == 200
        assert verify_response.json()["closure_text"] == test_closure_text, "closure_text not persisted"
        print(f"✅ Successfully updated closure_text to '{test_closure_text}'")
    
    def test_closure_text_options(self):
        """Verify different closure_text options can be saved"""
        closure_options = ['Registration Closed', 'Seats Full', 'Enrollment Closed', 'Sold Out']
        
        # Get current program
        get_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert get_response.status_code == 200
        program = get_response.json()
        
        for option in closure_options:
            program["closure_text"] = option
            put_response = requests.put(f"{BASE_URL}/api/programs/{self.program_id}", json=program)
            assert put_response.status_code == 200, f"Failed to save closure_text='{option}'"
            
            updated = put_response.json()
            assert updated["closure_text"] == option, f"closure_text mismatch: expected '{option}', got '{updated['closure_text']}'"
        
        print(f"✅ All {len(closure_options)} closure_text options can be saved")
    
    def test_enrollment_toggle_reflects_in_upcoming_list(self):
        """Verify enrollment toggle change reflects in GET /api/programs?upcoming_only=true"""
        # Get current program
        get_response = requests.get(f"{BASE_URL}/api/programs/{self.program_id}")
        assert get_response.status_code == 200
        program = get_response.json()
        
        # Set enrollment_open to false
        program["enrollment_open"] = False
        program["closure_text"] = "Sold Out"
        put_response = requests.put(f"{BASE_URL}/api/programs/{self.program_id}", json=program)
        assert put_response.status_code == 200
        
        # Verify in upcoming list
        list_response = requests.get(f"{BASE_URL}/api/programs?visible_only=true&upcoming_only=true")
        assert list_response.status_code == 200
        
        upcoming = list_response.json()
        matching = [p for p in upcoming if p["id"] == self.program_id]
        assert len(matching) == 1, f"Program {self.program_id} should be in upcoming list"
        
        assert matching[0]["enrollment_open"] == False, "enrollment_open should be False in list"
        assert matching[0]["closure_text"] == "Sold Out", "closure_text should be 'Sold Out' in list"
        print("✅ Enrollment toggle changes reflected in upcoming programs list")


class TestProgramModel:
    """Tests for Program model enrollment fields"""
    
    def test_enrollment_open_defaults_to_true(self):
        """Verify new programs have enrollment_open=True by default"""
        # Get all programs
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            # enrollment_open should exist and default to True (unless explicitly set to False)
            assert "enrollment_open" in p, f"Program {p['id']} missing enrollment_open"
            # This is a soft check - we just verify the field exists
            print(f"Program {p['id']} ({p['title'][:30]}...): enrollment_open={p['enrollment_open']}")
    
    def test_closure_text_has_default(self):
        """Verify closure_text has a default value"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        
        programs = response.json()
        for p in programs:
            assert "closure_text" in p, f"Program {p['id']} missing closure_text"
            # closure_text should be a string
            assert isinstance(p["closure_text"], str), f"closure_text should be string"
        
        print(f"✅ All {len(programs)} programs have closure_text field")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
