import requests

ADMIN_SERVICE_URL = "http://localhost:5000"

def get_services_from_admin(auth_header):
    """Fetch services from admin service using public endpoint"""
    try:
        # Use the public endpoint that doesn't require admin privileges
        response = requests.get(
            f"{ADMIN_SERVICE_URL}/services",
            headers={"Authorization": auth_header},
            timeout=5
        )
        if response.status_code == 200:
            services = response.json()
            print(f"[QUEUE] Successfully fetched {len(services)} services from admin service")
            return services
        else:
            print(f"[QUEUE] Error fetching services: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"[QUEUE] Error fetching services: {str(e)}")
        return []

def get_service_by_id_from_admin(service_id, auth_header):
    """Fetch specific service from admin service using public endpoint"""
    try:
        response = requests.get(
            f"{ADMIN_SERVICE_URL}/services/{service_id}",
            headers={"Authorization": auth_header},
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
        else:
            print(f"[QUEUE] Error fetching service {service_id}: {response.status_code}")
            return None
    except Exception as e:
        print(f"[QUEUE] Error fetching service: {str(e)}")
        return None