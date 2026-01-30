from controllers.service_controller import get_available_services, get_service_by_id
from controllers.queue_controller import (
    add_to_queue, get_queue, get_queue_by_service,
    get_queue_by_id, update_queue, delete_queue
)

def register_routes(app):
    """Register all routes for the queue service"""

    # ==========================================
    # SERVICE ENDPOINTS
    # ==========================================
    app.add_url_rule("/services", "get_available_services", get_available_services, methods=["GET"])
    app.add_url_rule("/services/<service_id>", "get_service_by_id", get_service_by_id, methods=["GET"])

    # ==========================================
    # QUEUE ENDPOINTS
    # ==========================================
    app.add_url_rule("/queue/add", "add_to_queue", add_to_queue, methods=["POST"])
    app.add_url_rule("/queue/get", "get_queue", get_queue, methods=["GET"])
    app.add_url_rule("/queue/service/<service_id>", "get_queue_by_service", get_queue_by_service, methods=["GET"])
    app.add_url_rule("/queue/get/<queue_id>", "get_queue_by_id", get_queue_by_id, methods=["GET"])
    app.add_url_rule("/queue/update/<queue_id>", "update_queue", update_queue, methods=["PUT"])
    app.add_url_rule("/queue/delete/<queue_id>", "delete_queue", delete_queue, methods=["DELETE"])