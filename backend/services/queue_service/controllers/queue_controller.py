from flask import request, jsonify
import uuid
from auth import authenticate_request
from services.admin_service_client import get_service_by_id_from_admin
from services.queue_service import (
    get_queue_count_for_service, add_queue_item, get_all_queue_items,
    get_user_queue_items, get_service_queue_items, get_queue_item_by_id,
    update_queue_item, remove_queue_item, recalculate_positions
)

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
        service_queue_count = get_queue_count_for_service(service["service_id"])
        if service_queue_count >= service.get("max_capacity", 50):
            return jsonify({"message": "Service queue is full"}), 400
    except Exception as e:
        return jsonify({"message": f"Error verifying service: {str(e)}"}), 500

    # Calculate position in service-specific queue
    position = service_queue_count + 1

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
    add_queue_item(item)

    # Recalculate positions for this service
    recalculate_positions(data.get("service_id"))

    print(f"[QUEUE] Added item: {queue_id} for user {auth_response.user_id} to service {data.get('service_id')}, position {position}")
    return jsonify(item), 201

def get_queue():
    """Get all queue items or user-specific items"""
    auth_response, error = authenticate_request()
    if error:
        return error

    # If user is admin, return all queue items
    # If user is regular user, return only their items
    if auth_response.is_admin:
        result = get_all_queue_items()
        print(f"[QUEUE] Admin {auth_response.user_id} fetching all {len(result)} items")
    else:
        result = get_user_queue_items(auth_response.user_id)
        print(f"[QUEUE] User {auth_response.user_id} fetching {len(result)} items")

    return jsonify(result), 200

def get_queue_by_service(service_id):
    """Get queue items for a specific service"""
    auth_response, error = authenticate_request()
    if error:
        return error

    service_queue = get_service_queue_items(service_id, include_all_statuses=auth_response.is_admin)

    print(f"[QUEUE] Fetched {len(service_queue)} items for service {service_id}")
    return jsonify(service_queue), 200

def get_queue_by_id(queue_id):
    """Get a specific queue item by ID"""
    auth_response, error = authenticate_request()
    if error:
        return error

    item = get_queue_item_by_id(queue_id)

    if not item:
        return jsonify({"message": "Queue item not found"}), 404

    # Regular users can only see their own items, admins can see all
    if not auth_response.is_admin and item.get("user_id") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403

    print(f"[QUEUE] Fetched item: {queue_id}")
    return jsonify(item), 200

def update_queue(queue_id):
    """Update a queue item"""
    auth_response, error = authenticate_request()
    if error:
        return error

    item = get_queue_item_by_id(queue_id)

    if not item:
        return jsonify({"message": "Queue item not found"}), 404

    # Only admins or the item owner can update
    if not auth_response.is_admin and item.get("user_id") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403

    data = request.json

    # Update allowed fields
    updates = {}
    if "name" in data:
        updates["name"] = data["name"]
    if "purpose" in data:
        updates["purpose"] = data["purpose"]
    if "serviceType" in data:
        updates["serviceType"] = data["serviceType"]

    # Only admins can update status
    old_status = item["status"]
    if "status" in data and auth_response.is_admin:
        updates["status"] = data["status"]

    updated_item = update_queue_item(queue_id, updates)

    # Recalculate positions if status changed
    if "status" in updates and old_status != updates["status"]:
        recalculate_positions(item.get("service_id"))

    print(f"[QUEUE] Updated item: {queue_id}")
    return jsonify(updated_item), 200

def delete_queue(queue_id):
    """Delete a queue item"""
    auth_response, error = authenticate_request()
    if error:
        return error

    item = get_queue_item_by_id(queue_id)

    if not item:
        return jsonify({"message": "Queue item not found"}), 404

    # Only admins or the item owner can delete
    if not auth_response.is_admin and item.get("user_id") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403

    service_id = item.get("service_id")
    remove_queue_item(item)

    # Recalculate positions for this service
    recalculate_positions(service_id)

    print(f"[QUEUE] Deleted item: {queue_id}")
    return jsonify({"message": "Queue item deleted successfully"}), 200