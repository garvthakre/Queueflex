from flask import Flask, request, jsonify
from grpc_client import verify_token
import requests

app = Flask(__name__)

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
    
    # Handle both "Bearer <token>" and plain "<token>" formats
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
        # Forward request to queue service with admin token
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
            
            # Count by service type
            for q in queues:
                service_type = q.get("serviceType", "unknown")
                stats["by_service_type"][service_type] = stats["by_service_type"].get(service_type, 0) + 1
                
                # Count by user
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