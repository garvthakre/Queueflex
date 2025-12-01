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

@app.route("/queue/add", methods=["POST"])
def add_to_queue():
    """Add a new item to the queue"""
    auth_response, error = authenticate_request()
    if error:
        return error

    data = request.json
    if not data or not data.get("name"):
        return jsonify({"message": "Name is required"}), 400

    queue_id = str(uuid.uuid4())
    item = {
        "queue_id": queue_id,
        "user_id": auth_response.user_id,
        "name": data.get("name"),
        "purpose": data.get("purpose"),
        "serviceType": data.get("serviceType"),
        "position": len(queue) + 1,
        "status": "waiting"
    }
    queue.append(item)
    print(f"[QUEUE] Added item: {queue_id} for user {auth_response.user_id}")
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

@app.route("/queue/get/<queue_id>", methods=["GET"])
def get_queue_by_id(queue_id):
    """Get a specific queue item by ID"""
    auth_response, error = authenticate_request()
    if error:
        return error

    # Find the queue item
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

    # Find the queue item
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
        item["status"] = data["status"]
    
    print(f"[QUEUE] Updated item: {queue_id}")
    return jsonify(item), 200

@app.route("/queue/delete/<queue_id>", methods=["DELETE"])
def delete_queue(queue_id):
    """Delete a queue item"""
    auth_response, error = authenticate_request()
    if error:
        return error

    # Find the queue item
    item = next((q for q in queue if q["queue_id"] == queue_id), None)
    
    if not item:
        return jsonify({"message": "Queue item not found"}), 404
    
    # Only admins or the item owner can delete
    if not auth_response.is_admin and item.get("user_id") != auth_response.user_id:
        return jsonify({"message": "Access denied"}), 403
    
    queue.remove(item)
    
    # Reorder positions
    for idx, q in enumerate(queue):
        q["position"] = idx + 1
    
    print(f"[QUEUE] Deleted item: {queue_id}")
    return jsonify({"message": "Queue item deleted successfully"}), 200

if __name__ == "__main__":
    app.run(port=4000, debug=True)