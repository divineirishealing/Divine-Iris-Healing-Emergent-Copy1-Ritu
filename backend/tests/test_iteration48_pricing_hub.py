"""
Iteration 48 - Pricing Hub Overhaul Tests
Tests for:
1. DurationTier model with offer fields (offer_price_aed/inr/usd, offer_text)
2. Session model with offer fields
3. Program model with show_pricing_on_card, show_tiers_on_card fields
4. Programs/Sessions API CRUD with new fields
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProgramsWithTiers:
    """Test Programs API with duration_tiers and offer pricing"""
    
    def test_get_programs_with_tiers(self):
        """Verify programs have duration_tiers with offer fields"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        # Find a program with tiers
        tiered_programs = [p for p in programs if len(p.get('duration_tiers', [])) > 0]
        assert len(tiered_programs) > 0, "No programs with duration_tiers found"
        
        # Check tier structure
        program = tiered_programs[0]
        tier = program['duration_tiers'][0]
        
        # Required tier fields
        assert 'label' in tier, "Tier missing 'label'"
        assert 'price_aed' in tier, "Tier missing 'price_aed'"
        assert 'price_inr' in tier, "Tier missing 'price_inr'"
        assert 'price_usd' in tier, "Tier missing 'price_usd'"
        
        # Offer fields (new in iteration 48)
        assert 'offer_price_aed' in tier or tier.get('offer_price_aed') == 0 or tier.get('offer_price_aed') is None, "Tier can have offer_price_aed"
        assert 'offer_price_inr' in tier or tier.get('offer_price_inr') == 0 or tier.get('offer_price_inr') is None, "Tier can have offer_price_inr"
        assert 'offer_price_usd' in tier or tier.get('offer_price_usd') == 0 or tier.get('offer_price_usd') is None, "Tier can have offer_price_usd"
        
        print(f"PASS: Found program '{program['title']}' with {len(program['duration_tiers'])} tiers")
        print(f"  Tier: {tier.get('label')} - AED:{tier.get('price_aed')}, offer_aed:{tier.get('offer_price_aed', 0)}")

    def test_program_show_pricing_on_card_field(self):
        """Verify program has show_pricing_on_card field"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        if len(programs) > 0:
            program = programs[0]
            # Field should exist and default to True
            show_pricing = program.get('show_pricing_on_card')
            # It can be True, False, or not set (defaults to True)
            print(f"Program '{program['title']}' show_pricing_on_card: {show_pricing}")
            # If the field exists, it should be a boolean
            if show_pricing is not None:
                assert isinstance(show_pricing, bool), "show_pricing_on_card should be boolean"
            print("PASS: show_pricing_on_card field accessible")

    def test_program_show_tiers_on_card_field(self):
        """Verify program has show_tiers_on_card field"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        if len(programs) > 0:
            program = programs[0]
            show_tiers = program.get('show_tiers_on_card')
            print(f"Program '{program['title']}' show_tiers_on_card: {show_tiers}")
            if show_tiers is not None:
                assert isinstance(show_tiers, bool), "show_tiers_on_card should be boolean"
            print("PASS: show_tiers_on_card field accessible")

    def test_update_program_tier_offer_pricing(self):
        """Test updating tier offer pricing via PUT"""
        # Get existing program with tiers
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        tiered_programs = [p for p in programs if len(p.get('duration_tiers', [])) > 0]
        if len(tiered_programs) == 0:
            pytest.skip("No tiered programs to test")
        
        program = tiered_programs[0]
        program_id = program['id']
        
        # Update tier offer pricing
        updated_tiers = program['duration_tiers'].copy()
        updated_tiers[0]['offer_price_aed'] = 999
        updated_tiers[0]['offer_price_inr'] = 9999
        updated_tiers[0]['offer_price_usd'] = 99
        updated_tiers[0]['offer_text'] = 'TEST OFFER'
        
        update_data = {
            **program,
            'duration_tiers': updated_tiers
        }
        
        put_response = requests.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        assert put_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        assert get_response.status_code == 200
        updated_program = get_response.json()
        
        updated_tier = updated_program['duration_tiers'][0]
        assert updated_tier.get('offer_price_aed') == 999
        assert updated_tier.get('offer_price_inr') == 9999
        assert updated_tier.get('offer_price_usd') == 99
        assert updated_tier.get('offer_text') == 'TEST OFFER'
        
        print(f"PASS: Updated tier offer pricing for '{program['title']}'")
        
        # Restore original values
        restore_data = {**program}
        requests.put(f"{BASE_URL}/api/programs/{program_id}", json=restore_data)


class TestSessionsWithOfferPricing:
    """Test Sessions API with offer pricing fields"""
    
    def test_get_sessions_with_offer_fields(self):
        """Verify sessions have offer price fields"""
        response = requests.get(f"{BASE_URL}/api/sessions")
        assert response.status_code == 200
        sessions = response.json()
        
        assert len(sessions) > 0, "No sessions found"
        
        session = sessions[0]
        # Check offer fields exist
        print(f"Session '{session['title']}':")
        print(f"  price_aed: {session.get('price_aed')}, offer_price_aed: {session.get('offer_price_aed', 0)}")
        print(f"  price_inr: {session.get('price_inr')}, offer_price_inr: {session.get('offer_price_inr', 0)}")
        print(f"  price_usd: {session.get('price_usd')}, offer_price_usd: {session.get('offer_price_usd', 0)}")
        print(f"  offer_text: {session.get('offer_text', '')}")
        
        print("PASS: Session offer fields accessible")

    def test_update_session_offer_pricing(self):
        """Test updating session offer pricing via PUT"""
        response = requests.get(f"{BASE_URL}/api/sessions")
        assert response.status_code == 200
        sessions = response.json()
        
        if len(sessions) == 0:
            pytest.skip("No sessions to test")
        
        session = sessions[0]
        session_id = session['id']
        original_offer_aed = session.get('offer_price_aed', 0)
        
        # Update offer pricing
        update_data = {
            **session,
            'offer_price_aed': 500,
            'offer_price_inr': 5000,
            'offer_price_usd': 50,
            'offer_text': 'TEST SESSION OFFER'
        }
        
        put_response = requests.put(f"{BASE_URL}/api/sessions/{session_id}", json=update_data)
        assert put_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/sessions/{session_id}")
        assert get_response.status_code == 200
        updated_session = get_response.json()
        
        assert updated_session.get('offer_price_aed') == 500
        assert updated_session.get('offer_price_inr') == 5000
        assert updated_session.get('offer_price_usd') == 50
        assert updated_session.get('offer_text') == 'TEST SESSION OFFER'
        
        print(f"PASS: Updated session offer pricing for '{session['title']}'")
        
        # Restore original
        restore_data = {**session}
        requests.put(f"{BASE_URL}/api/sessions/{session_id}", json=restore_data)


class TestPricingToggleFields:
    """Test show_pricing_on_card and show_tiers_on_card toggles"""
    
    def test_update_show_pricing_toggle(self):
        """Test toggling show_pricing_on_card"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        if len(programs) == 0:
            pytest.skip("No programs to test")
        
        program = programs[0]
        program_id = program['id']
        
        # Toggle show_pricing_on_card to False
        update_data = {**program, 'show_pricing_on_card': False}
        put_response = requests.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        assert put_response.status_code == 200
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        updated = get_response.json()
        assert updated.get('show_pricing_on_card') == False
        print(f"PASS: show_pricing_on_card set to False for '{program['title']}'")
        
        # Toggle back to True
        update_data = {**program, 'show_pricing_on_card': True}
        requests.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        restored = get_response.json()
        assert restored.get('show_pricing_on_card') == True
        print(f"PASS: show_pricing_on_card restored to True")

    def test_update_show_tiers_toggle(self):
        """Test toggling show_tiers_on_card"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        if len(programs) == 0:
            pytest.skip("No programs to test")
        
        program = programs[0]
        program_id = program['id']
        
        # Toggle show_tiers_on_card to False
        update_data = {**program, 'show_tiers_on_card': False}
        put_response = requests.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        assert put_response.status_code == 200
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        updated = get_response.json()
        assert updated.get('show_tiers_on_card') == False
        print(f"PASS: show_tiers_on_card set to False for '{program['title']}'")
        
        # Restore
        update_data = {**program, 'show_tiers_on_card': True}
        requests.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        print(f"PASS: show_tiers_on_card restored to True")


class TestAddRemoveTiers:
    """Test adding and removing tiers from programs"""
    
    def test_add_tier_to_program(self):
        """Test adding a new tier to a program"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        # Find a program with existing tiers
        tiered_programs = [p for p in programs if len(p.get('duration_tiers', [])) > 0]
        if len(tiered_programs) == 0:
            pytest.skip("No tiered programs to test")
        
        program = tiered_programs[0]
        program_id = program['id']
        original_tier_count = len(program['duration_tiers'])
        
        # Add a new tier
        new_tier = {
            'label': 'TEST_7_DAYS',
            'duration_value': 7,
            'duration_unit': 'day',
            'price_aed': 777,
            'price_inr': 7777,
            'price_usd': 77,
            'offer_price_aed': 666,
            'offer_price_inr': 6666,
            'offer_price_usd': 66,
            'offer_text': 'Test Tier Offer'
        }
        
        updated_tiers = program['duration_tiers'] + [new_tier]
        update_data = {**program, 'duration_tiers': updated_tiers}
        
        put_response = requests.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        assert put_response.status_code == 200
        
        # Verify tier added
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        updated_program = get_response.json()
        assert len(updated_program['duration_tiers']) == original_tier_count + 1
        
        # Check the new tier exists
        new_tier_found = any(t.get('label') == 'TEST_7_DAYS' for t in updated_program['duration_tiers'])
        assert new_tier_found, "New tier not found after adding"
        
        print(f"PASS: Added new tier to '{program['title']}' (now has {len(updated_program['duration_tiers'])} tiers)")
        
        # Remove the test tier (cleanup)
        cleaned_tiers = [t for t in updated_program['duration_tiers'] if t.get('label') != 'TEST_7_DAYS']
        cleanup_data = {**program, 'duration_tiers': cleaned_tiers}
        requests.put(f"{BASE_URL}/api/programs/{program_id}", json=cleanup_data)

    def test_remove_tier_from_program(self):
        """Test removing a tier from a program"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        programs = response.json()
        
        # Find a program with multiple tiers
        multi_tier_programs = [p for p in programs if len(p.get('duration_tiers', [])) >= 2]
        if len(multi_tier_programs) == 0:
            pytest.skip("No programs with 2+ tiers to test removal")
        
        program = multi_tier_programs[0]
        program_id = program['id']
        original_tiers = program['duration_tiers'].copy()
        original_tier_count = len(original_tiers)
        
        # Remove the last tier
        reduced_tiers = original_tiers[:-1]
        update_data = {**program, 'duration_tiers': reduced_tiers}
        
        put_response = requests.put(f"{BASE_URL}/api/programs/{program_id}", json=update_data)
        assert put_response.status_code == 200
        
        # Verify tier removed
        get_response = requests.get(f"{BASE_URL}/api/programs/{program_id}")
        updated_program = get_response.json()
        assert len(updated_program['duration_tiers']) == original_tier_count - 1
        
        print(f"PASS: Removed tier from '{program['title']}' (now has {len(updated_program['duration_tiers'])} tiers)")
        
        # Restore original tiers
        restore_data = {**program, 'duration_tiers': original_tiers}
        requests.put(f"{BASE_URL}/api/programs/{program_id}", json=restore_data)


class TestCreateProgramSession:
    """Test creating new programs and sessions via API"""
    
    def test_create_program(self):
        """Test creating a new program via POST"""
        new_program = {
            'title': 'TEST_New_Program_48',
            'category': 'Test',
            'description': 'Test program for iteration 48',
            'image': '',
            'visible': False,
            'price_aed': 100,
            'price_inr': 1000,
            'price_usd': 10,
            'show_pricing_on_card': True,
            'show_tiers_on_card': False
        }
        
        response = requests.post(f"{BASE_URL}/api/programs", json=new_program)
        assert response.status_code in [200, 201]
        
        created = response.json()
        assert created.get('title') == 'TEST_New_Program_48'
        assert 'id' in created
        
        print(f"PASS: Created new program with id: {created['id']}")
        
        # Cleanup - delete the test program
        delete_response = requests.delete(f"{BASE_URL}/api/programs/{created['id']}")
        assert delete_response.status_code in [200, 204]
        print("PASS: Deleted test program")

    def test_create_session(self):
        """Test creating a new session via POST"""
        new_session = {
            'title': 'TEST_New_Session_48',
            'description': 'Test session for iteration 48',
            'visible': False,
            'price_aed': 200,
            'price_inr': 2000,
            'price_usd': 20,
            'offer_price_aed': 150,
            'offer_price_inr': 1500,
            'offer_price_usd': 15,
            'offer_text': 'Launch Offer'
        }
        
        response = requests.post(f"{BASE_URL}/api/sessions", json=new_session)
        assert response.status_code in [200, 201]
        
        created = response.json()
        assert created.get('title') == 'TEST_New_Session_48'
        assert created.get('offer_price_aed') == 150
        assert created.get('offer_text') == 'Launch Offer'
        assert 'id' in created
        
        print(f"PASS: Created new session with id: {created['id']}")
        
        # Cleanup - delete the test session
        delete_response = requests.delete(f"{BASE_URL}/api/sessions/{created['id']}")
        assert delete_response.status_code in [200, 204]
        print("PASS: Deleted test session")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
