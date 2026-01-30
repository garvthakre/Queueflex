from flask import request, jsonify
from grpc_client import verify_token

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