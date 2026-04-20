from controllers.queue_controller import queue_bp
from controllers.service_controller import service_bp


def register_routes(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(queue_bp)
    app.register_blueprint(service_bp)