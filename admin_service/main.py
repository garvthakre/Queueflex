from flask import Flask, request, jsonify
from grpc_client import verify_token

app = Flask(__name__)

# Example admin-only data
admin_data = [
    {"id": 1, "task": "Check Queue Metrics"},
    {"id": 2, "task": "Manage Users"}
]

def extract_token(auth_header):
    """Extract token from Authorization header"""
    if not auth_header:
        return None
    
    # Handle both "Bearer <token>" and plain "<token>" formats
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return auth_header

@app.route("/admin/data", methods=["GET"])
def get_admin_data():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"message": "Token required"}), 401

    token = extract_token(auth_header)
    if not token:
        return jsonify({"message": "Invalid authorization format"}), 401

    try:
        auth_response = verify_token(token)
        if not auth_response.is_valid:
            return jsonify({"message": "Invalid token"}), 403

        if not auth_response.is_admin:
            return jsonify({"message": "Admin access required"}), 403
    except Exception as e:
        return jsonify({"message": f"Authentication error: {str(e)}"}), 403

    return jsonify(admin_data)

if __name__ == "__main__":
    app.run(port=5000, debug=True)