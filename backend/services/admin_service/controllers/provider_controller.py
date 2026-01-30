from flask import Blueprint, request, jsonify
import uuid
import db.db as db
from auth import verify_user
import requests

provider_bp = Blueprint('provider', __name__)

QUEUE_SERVICE_URL = "http://localhost:4000"

@provider_bp.route("/provider/services", methods=["GET"])
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

@provider_bp.route("/provider/services", methods=["POST"])
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

@provider_bp.route("/provider/services/<service_id>", methods=["PUT"])
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

@provider_bp.route("/provider/services/<service_id>", methods=["DELETE"])
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

@provider_bp.route("/provider/queue/all", methods=["GET"])
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

@provider_bp.route("/provider/queue/<queue_id>", methods=["PUT"])
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

@provider_bp.route("/provider/queue/<queue_id>", methods=["DELETE"])
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