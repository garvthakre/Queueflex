from flask import Flask, request, jsonify
from grpc_client import verify_token

app = Flask(__name__)

# Example admin-only data
admin_data = [
    {"id": 1, "task": "Check Queue Metrics"},
    {"id": 2, "task": "Manage Users"}
]

@app.route("/admin/data", methods=["GET"])
def get_admin_data():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token required"}), 401

    auth_response = verify_token(token)
    if not auth_response.is_valid:
        return jsonify({"message": "Invalid token"}), 403

    if not auth_response.is_admin:
        return jsonify({"message": "Admin access required"}), 403

    return jsonify(admin_data)

if __name__ == "__main__":
    app.run(port=5000)
