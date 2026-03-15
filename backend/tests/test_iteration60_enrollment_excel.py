"""
Iteration 60: Test Enrollment Form Changes & Excel Export
Tests:
1. Excel export endpoints return .xlsx files
2. Backend APIs are functional
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestExcelExport:
    """Test Excel export endpoints for Inbox and Client Garden"""

    def test_inbox_download_returns_xlsx(self):
        """GET /api/inbox/download returns Excel file with correct content-type"""
        response = requests.get(f"{BASE_URL}/api/inbox/download")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify content-type is Excel xlsx
        content_type = response.headers.get('content-type', '')
        assert 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' in content_type, \
            f"Expected xlsx content-type, got {content_type}"
        
        # Verify content-disposition has .xlsx filename
        content_disp = response.headers.get('content-disposition', '')
        assert '.xlsx' in content_disp, f"Expected .xlsx in content-disposition, got {content_disp}"
        
        # Verify response has content (xlsx starts with PK)
        assert len(response.content) > 100, "Response content too small for valid xlsx"
        assert response.content[:2] == b'PK', "Excel file should start with PK (ZIP signature)"
        
        print(f"PASS: Inbox download returns xlsx ({len(response.content)} bytes)")

    def test_clients_export_returns_xlsx(self):
        """GET /api/clients/export/csv returns Excel file (endpoint name is csv but returns xlsx)"""
        response = requests.get(f"{BASE_URL}/api/clients/export/csv")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify content-type is Excel xlsx
        content_type = response.headers.get('content-type', '')
        assert 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' in content_type, \
            f"Expected xlsx content-type, got {content_type}"
        
        # Verify content-disposition has .xlsx filename
        content_disp = response.headers.get('content-disposition', '')
        assert '.xlsx' in content_disp, f"Expected .xlsx in content-disposition, got {content_disp}"
        
        # Verify response has content (xlsx starts with PK)
        assert len(response.content) > 100, "Response content too small for valid xlsx"
        assert response.content[:2] == b'PK', "Excel file should start with PK (ZIP signature)"
        
        print(f"PASS: Clients export returns xlsx ({len(response.content)} bytes)")


class TestProgramsAPI:
    """Test Programs API for enrollment page"""
    
    def test_get_program_5_returns_valid_data(self):
        """GET /api/programs/5 returns program with required fields for enrollment"""
        response = requests.get(f"{BASE_URL}/api/programs/5")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify required fields exist
        assert 'id' in data, "Missing 'id' field"
        assert 'title' in data, "Missing 'title' field"
        assert 'enable_online' in data, "Missing 'enable_online' field"
        assert 'enable_offline' in data, "Missing 'enable_offline' field"
        
        # Verify expected values for enrollment modes
        assert data.get('enable_online') == True, "Program should have online mode enabled"
        assert data.get('enable_offline') == True, "Program should have offline mode enabled"
        
        print(f"PASS: Program 5 '{data.get('title')}' has valid enrollment data")


class TestDiscountsAPI:
    """Test Discounts API for enrollment flow"""
    
    def test_discounts_settings_returns_200(self):
        """GET /api/discounts/settings returns discount settings"""
        response = requests.get(f"{BASE_URL}/api/discounts/settings")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        
        print(f"PASS: Discounts settings returned")


class TestSettingsAPI:
    """Test Settings API for enrollment page"""
    
    def test_settings_returns_200(self):
        """GET /api/settings returns site settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, dict), "Response should be a dict"
        
        print(f"PASS: Settings returned")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
