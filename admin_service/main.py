from flask import Flask, request, jsonify
from grpc_client import verify_token
import requests
import uuid
import db
from flask_cors import CORS

app = Flask(__name__)
CORS(app   , resources={r"/*": {"origins": "http://localhost:3001"}},
    supports_credentials=True)

 
# Example admin-only data
admin_data = [
    {"id": 1, "task": "Check Queue Metrics"},
    {"id": 2, "task": "Manage Users"}
]

QUEUE_SERVICE_URL = "http://localhost:4000"

def extract_token(auth_header):
    """Extract token from Authorization header"""
    if not auth_header:
        return None
    
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return auth_header

def verify_admin(auth_header):
    """Verify token and check admin status"""
    if not auth_header:
        return None, (jsonify({"message": "Token required"}), 401)

    token = extract_token(auth_header)
    if not token:
        return None, (jsonify({"message": "Invalid authorization format"}), 401)

    try:
        auth_response = verify_token(token)
        if not auth_response.is_valid:
            return None, (jsonify({"message": "Invalid token"}), 403)

        if not auth_response.is_admin:
            return None, (jsonify({"message": "Admin access required"}), 403)
        
        return auth_response, None
    except Exception as e:
        return None, (jsonify({"message": f"Authentication error: {str(e)}"}), 403)

def verify_user(auth_header):
    """Verify token but do not require admin privileges"""
    if not auth_header:
        return None, (jsonify({"message": "Token required"}), 401)

    token = extract_token(auth_header)
    if not token:
        return None, (jsonify({"message": "Invalid authorization format"}), 401)

    try:
        auth_response = verify_token(token)
        if not auth_response.is_valid:
            return None, (jsonify({"message": "Invalid token"}), 403)

        return auth_response, None
    except Exception as e:
        return None, (jsonify({"message": f"Authentication error: {str(e)}"}), 403)
 
@app.route("/admin/services", methods=["POST"])
def create_service():
    """Create a new service (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    data = request.json
    if not data or not data.get("name"):
        return jsonify({"message": "Service name is required"}), 400

    service_id = str(uuid.uuid4())
    service = {
        "service_id": service_id,
        "name": data.get("name"),
        "description": data.get("description", ""),
        "category": data.get("category", "General"),
        "max_capacity": data.get("max_capacity", 50),
        "estimated_time_per_person": data.get("estimated_time_per_person", 15),
        "status": "active",
        "created_by": auth_response.user_id
    }
    
    try:
        created_service = db.create_service(service)
        print(f"[ADMIN] Created service: {service_id} - {service['name']}")
        return jsonify(created_service), 201
    except Exception as e:
        print(f"[ADMIN] Error creating service: {str(e)}")
        return jsonify({"message": f"Error creating service: {str(e)}"}), 500

@app.route("/admin/services", methods=["GET"])
def get_all_services_admin():
    """Get all services (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    try:
        all_services = db.get_all_services()
        print(f"[ADMIN] Fetched all {len(all_services)} services")
        return jsonify(all_services), 200
    except Exception as e:
        print(f"[ADMIN] Error fetching services: {str(e)}")
        return jsonify({"message": f"Error fetching services: {str(e)}"}), 500

@app.route("/admin/services/<service_id>", methods=["PUT"])
def update_service(service_id):
    """Update a service (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    service = db.get_service_by_id(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    data = request.json
    updates = {}
    
    if "name" in data:
        updates["name"] = data["name"]
    if "description" in data:
        updates["description"] = data["description"]
    if "category" in data:
        updates["category"] = data["category"]
    if "max_capacity" in data:
        updates["max_capacity"] = data["max_capacity"]
    if "estimated_time_per_person" in data:
        updates["estimated_time_per_person"] = data["estimated_time_per_person"]
    if "status" in data:
        updates["status"] = data["status"]

    try:
        updated_service = db.update_service(service_id, updates)
        print(f"[ADMIN] Updated service: {service_id}")
        return jsonify(updated_service), 200
    except Exception as e:
        print(f"[ADMIN] Error updating service: {str(e)}")
        return jsonify({"message": f"Error updating service: {str(e)}"}), 500

@app.route("/admin/services/<service_id>", methods=["DELETE"])
def delete_service(service_id):
    """Delete a service (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    service = db.get_service_by_id(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    try:
        db.delete_service(service_id)
        print(f"[ADMIN] Deleted service: {service_id}")
        return jsonify({"message": "Service deleted successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error deleting service: {str(e)}")
        return jsonify({"message": f"Error deleting service: {str(e)}"}), 500

# ==========================================
# PUBLIC SERVICE ENDPOINTS (for queue service)
# ==========================================

@app.route("/services", methods=["GET"])
def get_services_public():
    """Get active services (public endpoint - requires authentication but not admin)"""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        return jsonify({"message": "Token required"}), 401

    token = extract_token(auth_header)
    if not token:
        return jsonify({"message": "Invalid authorization format"}), 401

    try:
        # Verify token is valid (but don't require admin)
        auth_response = verify_token(token)
        if not auth_response.is_valid:
            return jsonify({"message": "Invalid token"}), 403
        
        # Return only active services for regular users
        all_services = db.get_all_services()
        active_services = [s for s in all_services if s.get("status") == "active"]
        
        print(f"[ADMIN] Public endpoint: Fetched {len(active_services)} active services for user {auth_response.user_id}")
        return jsonify(active_services), 200
        
    except Exception as e:
        print(f"[ADMIN] Error in public services endpoint: {str(e)}")
        return jsonify({"message": f"Error fetching services: {str(e)}"}), 500


@app.route("/provider/services", methods=["GET"])
def get_provider_services():
    """Get services created by the logged-in provider (requires auth)"""
    auth_response, error = verify_user(request.headers.get("Authorization"))
    if error:
        return error

    try:
        all_services = db.get_all_services()
        user_id = auth_response.user_id
        my_services = [s for s in all_services if s.get("created_by") == user_id]
        print(f"[ADMIN] Provider endpoint: Fetched {len(my_services)} services for provider {user_id}")
        return jsonify(my_services), 200
    except Exception as e:
        print(f"[ADMIN] Error fetching provider services: {str(e)}")
        return jsonify({"message": f"Error fetching services: {str(e)}"}), 500


@app.route("/provider/services", methods=["POST"])
def create_provider_service():
    """Create a new service as the logged-in provider (requires auth)"""
    auth_response, error = verify_user(request.headers.get("Authorization"))
    if error:
        return error

    data = request.json
    if not data or not data.get("name"):
        return jsonify({"message": "Service name is required"}), 400

    service_id = str(uuid.uuid4())
    service = {
        "service_id": service_id,
        "name": data.get("name"),
        "description": data.get("description", ""),
        "category": data.get("category", "General"),
        "max_capacity": data.get("max_capacity", 50),
        "estimated_time_per_person": data.get("estimated_time_per_person", 15),
        "status": "active",
        "created_by": auth_response.user_id
    }
    try:
        created_service = db.create_service(service)
        print(f"[ADMIN] Provider created service: {service_id} - {service['name']}")
        return jsonify(created_service), 201
    except Exception as e:
        print(f"[ADMIN] Error creating provider service: {str(e)}")
        return jsonify({"message": f"Error creating service: {str(e)}"}), 500


@app.route("/provider/services/<service_id>", methods=["PUT"])
def update_provider_service(service_id):
    """Update a service owned by the provider"""
    auth_response, error = verify_user(request.headers.get("Authorization"))
    if error:
        return error

    service = db.get_service_by_id(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    # ensure the logged-in user owns this service
    if service.get("created_by") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403

    data = request.json
    updates = {}
    if "name" in data:
        updates["name"] = data["name"]
    if "description" in data:
        updates["description"] = data["description"]
    if "category" in data:
        updates["category"] = data["category"]
    if "max_capacity" in data:
        updates["max_capacity"] = data["max_capacity"]
    if "estimated_time_per_person" in data:
        updates["estimated_time_per_person"] = data["estimated_time_per_person"]
    if "status" in data:
        updates["status"] = data["status"]

    try:
        updated = db.update_service(service_id, updates)
        print(f"[ADMIN] Provider updated service: {service_id}")
        return jsonify(updated), 200
    except Exception as e:
        print(f"[ADMIN] Error updating provider service: {str(e)}")
        return jsonify({"message": f"Error updating service: {str(e)}"}), 500


@app.route("/provider/services/<service_id>", methods=["DELETE"])
def delete_provider_service(service_id):
    """Delete a service owned by the provider"""
    auth_response, error = verify_user(request.headers.get("Authorization"))
    if error:
        return error

    service = db.get_service_by_id(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.get("created_by") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403

    try:
        db.delete_service(service_id)
        print(f"[ADMIN] Provider deleted service: {service_id}")
        return jsonify({"message": "Service deleted successfully"}), 200
    except Exception as e:
        print(f"[ADMIN] Error deleting provider service: {str(e)}")
        return jsonify({"message": f"Error deleting service: {str(e)}"}), 500


@app.route("/provider/queue/all", methods=["GET"])
def get_provider_queues():
    """Get queue items for services owned by the logged-in provider"""
    auth_response, error = verify_user(request.headers.get("Authorization"))
    if error:
        return error

    try:
        # fetch all queue items from queue service (supply same auth header)
        response = requests.get(
            f"{QUEUE_SERVICE_URL}/queue/get",
            headers={"Authorization": request.headers.get("Authorization")}
        )
        if response.status_code != 200:
            return jsonify(response.json()), response.status_code

        queues = response.json()
        # find services owned by this provider
        all_services = db.get_all_services()
        owned_ids = {s.get("service_id") for s in all_services if s.get("created_by") == auth_response.user_id}
        filtered = [q for q in queues if str(q.get("service_id")) in owned_ids]
        print(f"[ADMIN] Provider fetched {len(filtered)} queue items for provider {auth_response.user_id}")
        return jsonify(filtered), 200
    except Exception as e:
        print(f"[ADMIN] Error fetching provider queues: {str(e)}")
        return jsonify({"message": f"Error fetching queues: {str(e)}"}), 500

@app.route("/services/<service_id>", methods=["GET"])
def get_service_public(service_id):
    """Get specific service (public endpoint - requires authentication but not admin)"""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        return jsonify({"message": "Token required"}), 401

    token = extract_token(auth_header)
    if not token:
        return jsonify({"message": "Invalid authorization format"}), 401

    try:
        # Verify token is valid (but don't require admin)
        auth_response = verify_token(token)
        if not auth_response.is_valid:
            return jsonify({"message": "Invalid token"}), 403
        
        service = db.get_service_by_id(service_id)
        
        if not service:
            return jsonify({"message": "Service not found"}), 404
        
        # Only return if service is active (for regular users)
        if service.get("status") != "active" and not auth_response.is_admin:
            return jsonify({"message": "Service not found"}), 404
        
        print(f"[ADMIN] Public endpoint: Fetched service {service_id} for user {auth_response.user_id}")
        return jsonify(service), 200
        
    except Exception as e:
        print(f"[ADMIN] Error in public service endpoint: {str(e)}")
        return jsonify({"message": f"Error fetching service: {str(e)}"}), 500

# ==========================================
# EXISTING ENDPOINTS
# ==========================================

@app.route("/admin/data", methods=["GET"])
def get_admin_data():
    """Get admin-specific data"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    return jsonify(admin_data), 200

@app.route("/admin/queue/all", methods=["GET"])
def get_all_queues():
    """Get all queue items (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    try:
        response = requests.get(
            f"{QUEUE_SERVICE_URL}/queue/get",
            headers={"Authorization": request.headers.get("Authorization")}
        )
        print(f"[ADMIN] Fetched all queues: {response.status_code}")
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f"[ADMIN] Error fetching queues: {str(e)}")
        return jsonify({"message": f"Error fetching queues: {str(e)}"}), 500

@app.route("/admin/queue/<queue_id>", methods=["GET"])
def get_queue_by_id(queue_id):
    """Get specific queue item by ID (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    try:
        response = requests.get(
            f"{QUEUE_SERVICE_URL}/queue/get/{queue_id}",
            headers={"Authorization": request.headers.get("Authorization")}
        )
        print(f"[ADMIN] Fetched queue {queue_id}: {response.status_code}")
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f"[ADMIN] Error fetching queue: {str(e)}")
        return jsonify({"message": f"Error fetching queue: {str(e)}"}), 500

@app.route("/admin/queue/<queue_id>", methods=["PUT"])
def update_queue(queue_id):
    """Update queue item (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    try:
        response = requests.put(
            f"{QUEUE_SERVICE_URL}/queue/update/{queue_id}",
            json=request.json,
            headers={"Authorization": request.headers.get("Authorization")}
        )
        print(f"[ADMIN] Updated queue {queue_id}: {response.status_code}")
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f"[ADMIN] Error updating queue: {str(e)}")
        return jsonify({"message": f"Error updating queue: {str(e)}"}), 500

@app.route("/admin/queue/<queue_id>", methods=["DELETE"])
def delete_queue(queue_id):
    """Delete queue item (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    try:
        response = requests.delete(
            f"{QUEUE_SERVICE_URL}/queue/delete/{queue_id}",
            headers={"Authorization": request.headers.get("Authorization")}
        )
        print(f"[ADMIN] Deleted queue {queue_id}: {response.status_code}")
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f"[ADMIN] Error deleting queue: {str(e)}")
        return jsonify({"message": f"Error deleting queue: {str(e)}"}), 500


@app.route("/provider/queue/<queue_id>", methods=["PUT"])
def update_provider_queue(queue_id):
    """Update a queue item if it belongs to one of the provider's services"""
    auth_response, error = verify_user(request.headers.get("Authorization"))
    if error:
        return error

    try:
        # fetch the queue item from queue service
        resp = requests.get(f"{QUEUE_SERVICE_URL}/queue/get/{queue_id}", headers={"Authorization": request.headers.get("Authorization")})
        if resp.status_code != 200:
            return jsonify(resp.json()), resp.status_code

        item = resp.json()
        # check ownership of the service
        service = db.get_service_by_id(item.get("service_id"))
        if not service or service.get("created_by") != auth_response.user_id:
            return jsonify({"message": "Access denied"}), 403

        # forward update to queue service
        forward = requests.put(f"{QUEUE_SERVICE_URL}/queue/update/{queue_id}", json=request.json, headers={"Authorization": request.headers.get("Authorization")})
        return jsonify(forward.json()), forward.status_code
    except Exception as e:
        print(f"[ADMIN] Error updating provider queue: {str(e)}")
        return jsonify({"message": f"Error updating queue: {str(e)}"}), 500


@app.route("/provider/queue/<queue_id>", methods=["DELETE"])
def delete_provider_queue(queue_id):
    """Delete a queue item if it belongs to one of the provider's services"""
    auth_response, error = verify_user(request.headers.get("Authorization"))
    if error:
        return error

    try:
        resp = requests.get(f"{QUEUE_SERVICE_URL}/queue/get/{queue_id}", headers={"Authorization": request.headers.get("Authorization")})
        if resp.status_code != 200:
            return jsonify(resp.json()), resp.status_code

        item = resp.json()
        service = db.get_service_by_id(item.get("service_id"))
        if not service or service.get("created_by") != auth_response.user_id:
            return jsonify({"message": "Access denied"}), 403

        forward = requests.delete(f"{QUEUE_SERVICE_URL}/queue/delete/{queue_id}", headers={"Authorization": request.headers.get("Authorization")})
        return jsonify(forward.json()), forward.status_code
    except Exception as e:
        print(f"[ADMIN] Error deleting provider queue: {str(e)}")
        return jsonify({"message": f"Error deleting queue: {str(e)}"}), 500

@app.route("/admin/queue/stats", methods=["GET"])
def get_queue_stats():
    """Get queue statistics (admin only)"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    try:
        response = requests.get(
            f"{QUEUE_SERVICE_URL}/queue/get",
            headers={"Authorization": request.headers.get("Authorization")}
        )
        
        if response.status_code == 200:
            queues = response.json()
            stats = {
                "total_items": len(queues),
                "waiting": len([q for q in queues if q.get("status") == "waiting"]),
                "by_service_type": {},
                "by_user": {}
            }
            
            for q in queues:
                service_type = q.get("serviceType", "unknown")
                stats["by_service_type"][service_type] = stats["by_service_type"].get(service_type, 0) + 1
                
                user_id = str(q.get("user_id", "unknown"))
                stats["by_user"][user_id] = stats["by_user"].get(user_id, 0) + 1
            
            print(f"[ADMIN] Generated stats: {stats['total_items']} total items")
            return jsonify(stats), 200
        else:
            return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f"[ADMIN] Error fetching stats: {str(e)}")
        return jsonify({"message": f"Error fetching stats: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)