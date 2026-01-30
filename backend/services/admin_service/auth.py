from flask import jsonify
from grpc_client import verify_token

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