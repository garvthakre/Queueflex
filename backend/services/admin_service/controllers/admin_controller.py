from flask import Blueprint, request, jsonify
import uuid
import db.db as db
from auth import verify_admin
import requests

admin_bp = Blueprint('admin', __name__)

# Example admin-only data
admin_data = [
    {"id": 1, "task": "Check Queue Metrics"},
    {"id": 2, "task": "Manage Users"}
]

QUEUE_SERVICE_URL = "http://localhost:4000"

@admin_bp.route("/admin/services", methods=["POST"])
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

@admin_bp.route("/admin/services", methods=["GET"])
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

@admin_bp.route("/admin/services/<service_id>", methods=["PUT"])
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

@admin_bp.route("/admin/services/<service_id>", methods=["DELETE"])
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

@admin_bp.route("/admin/data", methods=["GET"])
def get_admin_data():
    """Get admin-specific data"""
    auth_response, error = verify_admin(request.headers.get("Authorization"))
    if error:
        return error

    return jsonify(admin_data), 200

@admin_bp.route("/admin/queue/all", methods=["GET"])
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

@admin_bp.route("/admin/queue/<queue_id>", methods=["GET"])
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

@admin_bp.route("/admin/queue/<queue_id>", methods=["PUT"])
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

@admin_bp.route("/admin/queue/<queue_id>", methods=["DELETE"])
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

@admin_bp.route("/admin/queue/stats", methods=["GET"])
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