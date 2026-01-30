from controllers.admin_controller import admin_bp
from controllers.provider_controller import provider_bp
from controllers.public_controller import public_bp

def register_routes(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(admin_bp)
    app.register_blueprint(provider_bp)
    app.register_blueprint(public_bp)