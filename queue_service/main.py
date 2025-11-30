from flask import Flask, request, jsonify
from grpc_client import verify_token
import uuid

app = Flask(__name__)
queue = []

def extract_token(auth_header):
    """Extract token from Authorization header"""
    if not auth_header:
        return None
    
    # Handle both "Bearer <token>" and plain "<token>" formats
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return auth_header

@app.route("/queue/add", methods=["POST"])
def add_to_queue():
    auth_header = request.headers.get("Authorization")
    print(f"[DEBUG] Authorization header: {auth_header}")
    
    if not auth_header:
        return jsonify({"message": "Token required"}), 401

    token = extract_token(auth_header)
    print(f"[DEBUG] Extracted token: {token[:20]}..." if token else "[DEBUG] No token extracted")
    
    if not token:
        return jsonify({"message": "Invalid authorization format"}), 401

    try:
        auth_response = verify_token(token)
        print(f"[DEBUG] Auth response - is_valid: {auth_response.is_valid}, is_admin: {auth_response.is_admin}, user_id: {auth_response.user_id}")
        
        if not auth_response.is_valid:
            return jsonify({"message": "Invalid token"}), 403
    except Exception as e:
        print(f"[DEBUG] Exception during verification: {str(e)}")
        return jsonify({"message": f"Authentication error: {str(e)}"}), 403

    data = request.json
    queue_id = str(uuid.uuid4())
    item = {
        "queue_id": queue_id,
        "name": data.get("name"),
        "purpose": data.get("purpose"),
        "serviceType": data.get("serviceType"),
        "position": len(queue)+1
    }
    queue.append(item)
    return jsonify(item)

@app.route("/queue/get", methods=["GET"])
def get_queue():
    auth_header = request.headers.get("Authorization")
    print(f"[DEBUG] Authorization header: {auth_header}")
    
    if not auth_header:
        return jsonify({"message": "Token required"}), 401

    token = extract_token(auth_header)
    print(f"[DEBUG] Extracted token: {token[:20]}..." if token else "[DEBUG] No token extracted")
    
    if not token:
        return jsonify({"message": "Invalid authorization format"}), 401

    try:
        auth_response = verify_token(token)
        print(f"[DEBUG] Auth response - is_valid: {auth_response.is_valid}, is_admin: {auth_response.is_admin}, user_id: {auth_response.user_id}")
        
        if not auth_response.is_valid:
            return jsonify({"message": "Invalid token"}), 403
    except Exception as e:
        print(f"[DEBUG] Exception during verification: {str(e)}")
        return jsonify({"message": f"Authentication error: {str(e)}"}), 403

    return jsonify(queue)

if __name__ == "__main__":
    app.run(port=4000, debug=True)