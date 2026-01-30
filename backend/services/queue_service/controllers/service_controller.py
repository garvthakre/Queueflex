from flask import jsonify
from auth import authenticate_request
from services.admin_service_client import get_services_from_admin, get_service_by_id_from_admin
from services.queue_service import get_queue_count_for_service

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
            service["current_queue_count"] = get_queue_count_for_service(service["service_id"])

        print(f"[QUEUE] Fetched {len(active_services)} active services")
        return jsonify(active_services), 200
    except Exception as e:
        print(f"[QUEUE] Error fetching services: {str(e)}")
        return jsonify({"message": f"Error fetching services: {str(e)}"}), 500

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
        service["current_queue_count"] = get_queue_count_for_service(service_id)

        print(f"[QUEUE] Fetched service: {service_id}")
        return jsonify(service), 200
    except Exception as e:
        print(f"[QUEUE] Error fetching service: {str(e)}")
        return jsonify({"message": f"Error fetching service: {str(e)}"}), 500