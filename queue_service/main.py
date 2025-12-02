from flask import Flask, request, jsonify
from grpc_client import verify_token
import uuid
import requests

app = Flask(__name__)
queue = []

ADMIN_SERVICE_URL = "http://localhost:5000"

def extract_token(auth_header):
    """Extract token from Authorization header"""
    if not auth_header:
        return None
    
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return auth_header

def authenticate_request():
    """Helper function to authenticate requests"""
    auth_header = request.headers.get("Authorization")
    print(f"[DEBUG] Authorization header: {auth_header}")
    
    if not auth_header:
        return None, (jsonify({"message": "Token required"}), 401)

    token = extract_token(auth_header)
    print(f"[DEBUG] Extracted token: {token[:20]}..." if token else "[DEBUG] No token extracted")
    
    if not token:
        return None, (jsonify({"message": "Invalid authorization format"}), 401)

    try:
        auth_response = verify_token(token)
        print(f"[DEBUG] Auth response - is_valid: {auth_response.is_valid}, is_admin: {auth_response.is_admin}, user_id: {auth_response.user_id}")
        
        if not auth_response.is_valid:
            return None, (jsonify({"message": "Invalid token"}), 403)
        
        return auth_response, None
    except Exception as e:
        print(f"[DEBUG] Exception during verification: {str(e)}")
        return None, (jsonify({"message": f"Authentication error: {str(e)}"}), 403)

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

# ==========================================
# SERVICE ENDPOINTS (PUBLIC)
# ==========================================

@app.route("/services", methods=["GET"])
def get_available_services():
    """Get all available services (public - requires authentication)"""
    auth_response, error = authenticate_request()
    if error:
        return error

    try:
        all_services = get_services_from_admin(request.headers.get("Authorization"))
        
        # Filter only active services for regular users
        active_services = [s for s in all_services if s.get("status") == "active"]
        
        # Add current queue count to each service
        for service in active_services:
            service_queue = [q for q in queue if q.get("service_id") == service["service_id"] and q.get("status") == "waiting"]
            service["current_queue_count"] = len(service_queue)
        
        print(f"[QUEUE] Fetched {len(active_services)} active services")
        return jsonify(active_services), 200
    except Exception as e:
        print(f"[QUEUE] Error fetching services: {str(e)}")
        return jsonify({"message": f"Error fetching services: {str(e)}"}), 500

@app.route("/services/<service_id>", methods=["GET"])
def get_service_by_id(service_id):
    """Get a specific service by ID"""
    auth_response, error = authenticate_request()
    if error:
        return error

    try:
        service = get_service_by_id_from_admin(service_id, request.headers.get("Authorization"))
        
        if not service:
            return jsonify({"message": "Service not found"}), 404
            
        # Get queue count for this service
        service_queue = [q for q in queue if q.get("service_id") == service_id and q.get("status") == "waiting"]
        service["current_queue_count"] = len(service_queue)
        
        print(f"[QUEUE] Fetched service: {service_id}")
        return jsonify(service), 200
    except Exception as e:
        print(f"[QUEUE] Error fetching service: {str(e)}")
        return jsonify({"message": f"Error fetching service: {str(e)}"}), 500

# ==========================================
# QUEUE ENDPOINTS
# ==========================================

@app.route("/queue/add", methods=["POST"])
def add_to_queue():
    """Add a new item to the queue for a specific service"""
    auth_response, error = authenticate_request()
    if error:
        return error

    data = request.json
    if not data or not data.get("name"):
        return jsonify({"message": "Name is required"}), 400
    
    if not data.get("service_id"):
        return jsonify({"message": "Service ID is required"}), 400

    # Verify service exists and is active
    try:
        service = get_service_by_id_from_admin(data.get("service_id"), request.headers.get("Authorization"))
        
        if not service:
            return jsonify({"message": "Service not found"}), 404
        
        if service.get("status") != "active":
            return jsonify({"message": "Service is not currently active"}), 400
        
        # Check capacity
        service_queue_count = len([q for q in queue if q.get("service_id") == service["service_id"] and q.get("status") == "waiting"])
        if service_queue_count >= service.get("max_capacity", 50):
            return jsonify({"message": "Service queue is full"}), 400
    except Exception as e:
        return jsonify({"message": f"Error verifying service: {str(e)}"}), 500

    # Calculate position in service-specific queue
    service_queue = [q for q in queue if q.get("service_id") == data.get("service_id") and q.get("status") == "waiting"]
    position = len(service_queue) + 1

    queue_id = str(uuid.uuid4())
    item = {
        "queue_id": queue_id,
        "user_id": auth_response.user_id,
        "service_id": data.get("service_id"),
        "name": data.get("name"),
        "purpose": data.get("purpose", ""),
        "serviceType": service.get("name", service.get("category", "General")),
        "position": position,
        "status": "waiting"
    }
    queue.append(item)
    
    # Recalculate positions for this service
    recalculate_positions(data.get("service_id"))
    
    print(f"[QUEUE] Added item: {queue_id} for user {auth_response.user_id} to service {data.get('service_id')}, position {position}")
    return jsonify(item), 201

@app.route("/queue/get", methods=["GET"])
def get_queue():
    """Get all queue items or user-specific items"""
    auth_response, error = authenticate_request()
    if error:
        return error

    # If user is admin, return all queue items
    # If user is regular user, return only their items
    if auth_response.is_admin:
        result = queue
        print(f"[QUEUE] Admin {auth_response.user_id} fetching all {len(queue)} items")
    else:
        result = [item for item in queue if item.get("user_id") == auth_response.user_id]
        print(f"[QUEUE] User {auth_response.user_id} fetching {len(result)} items")
    
    return jsonify(result), 200

@app.route("/queue/service/<service_id>", methods=["GET"])
def get_queue_by_service(service_id):
    """Get queue items for a specific service"""
    auth_response, error = authenticate_request()
    if error:
        return error

    service_queue = [q for q in queue if q.get("service_id") == service_id]
    
    # Regular users can only see waiting items, admins can see all
    if not auth_response.is_admin:
        service_queue = [q for q in service_queue if q.get("status") == "waiting"]
    
    print(f"[QUEUE] Fetched {len(service_queue)} items for service {service_id}")
    return jsonify(service_queue), 200

@app.route("/queue/get/<queue_id>", methods=["GET"])
def get_queue_by_id(queue_id):
    """Get a specific queue item by ID"""
    auth_response, error = authenticate_request()
    if error:
        return error

    item = next((q for q in queue if q["queue_id"] == queue_id), None)
    
    if not item:
        return jsonify({"message": "Queue item not found"}), 404
    
    # Regular users can only see their own items, admins can see all
    if not auth_response.is_admin and item.get("user_id") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403
    
    print(f"[QUEUE] Fetched item: {queue_id}")
    return jsonify(item), 200

@app.route("/queue/update/<queue_id>", methods=["PUT"])
def update_queue(queue_id):
    """Update a queue item"""
    auth_response, error = authenticate_request()
    if error:
        return error

    item = next((q for q in queue if q["queue_id"] == queue_id), None)
    
    if not item:
        return jsonify({"message": "Queue item not found"}), 404
    
    # Only admins or the item owner can update
    if not auth_response.is_admin and item.get("user_id") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403
    
    data = request.json
    
    # Update allowed fields
    if "name" in data:
        item["name"] = data["name"]
    if "purpose" in data:
        item["purpose"] = data["purpose"]
    if "serviceType" in data:
        item["serviceType"] = data["serviceType"]
    
    # Only admins can update status
    if "status" in data and auth_response.is_admin:
        old_status = item["status"]
        item["status"] = data["status"]
        
        # Recalculate positions if status changed
        if old_status != data["status"]:
            recalculate_positions(item.get("service_id"))
    
    print(f"[QUEUE] Updated item: {queue_id}")
    return jsonify(item), 200

@app.route("/queue/delete/<queue_id>", methods=["DELETE"])
def delete_queue(queue_id):
    """Delete a queue item"""
    auth_response, error = authenticate_request()
    if error:
        return error

    item = next((q for q in queue if q["queue_id"] == queue_id), None)
    
    if not item:
        return jsonify({"message": "Queue item not found"}), 404
    
    # Only admins or the item owner can delete
    if not auth_response.is_admin and item.get("user_id") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403
    
    service_id = item.get("service_id")
    queue.remove(item)
    
    # Recalculate positions for this service
    recalculate_positions(service_id)
    
    print(f"[QUEUE] Deleted item: {queue_id}")
    return jsonify({"message": "Queue item deleted successfully"}), 200

def recalculate_positions(service_id):
    """Recalculate queue positions for a specific service"""
    if not service_id:
        return
    
    service_queue = [q for q in queue if q.get("service_id") == service_id and q.get("status") == "waiting"]
    service_queue.sort(key=lambda x: queue.index(x))  # Maintain insertion order
    
    for idx, item in enumerate(service_queue):
        item["position"] = idx + 1

if __name__ == "__main__":
    app.run(port=4000, debug=True)