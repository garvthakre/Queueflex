from flask import Flask, request, jsonify
from grpc_client import verify_token
import uuid

app = Flask(__name__)
queue = []

@app.route("/queue/add", methods=["POST"])
def add_to_queue():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token required"}), 401

    auth_response = verify_token(token)
    if not auth_response.is_valid:
        return jsonify({"message": "Invalid token"}), 403

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
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token required"}), 401

    auth_response = verify_token(token)
    if not auth_response.is_valid:
        return jsonify({"message": "Invalid token"}), 403

    return jsonify(queue)

app.run(port=4000)
