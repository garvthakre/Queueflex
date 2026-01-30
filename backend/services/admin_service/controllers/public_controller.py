from flask import Blueprint, request, jsonify
import db.db as db
from auth import verify_user, extract_token
from grpc_client import verify_token

public_bp = Blueprint('public', __name__)

@public_bp.route("/services", methods=["GET"])
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

@public_bp.route("/services/<service_id>", methods=["GET"])
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