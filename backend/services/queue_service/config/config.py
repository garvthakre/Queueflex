import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_SERVICE_URL = os.environ.get("ADMIN_SERVICE_URL", "http://localhost:5000")
GRPC_HOST = os.environ.get("AUTH_GRPC_HOST", "localhost:50051")
PORT = int(os.environ.get("PORT", 4000))
FLASK_ENV = os.environ.get("FLASK_ENV", "development")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")