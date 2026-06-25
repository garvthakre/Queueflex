import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
QUEUE_SERVICE_URL = os.environ.get("QUEUE_SERVICE_URL", "http://localhost:4000")
GRPC_HOST = os.environ.get("AUTH_GRPC_HOST", "localhost:50051")
PORT = int(os.environ.get("PORT", 5000))
FLASK_ENV = os.environ.get("FLASK_ENV", "development")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")