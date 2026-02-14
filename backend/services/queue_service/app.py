 
import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from routes import register_routes

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get CORS origins from environment
cors_origins = os.environ.get('CORS_ORIGIN', '*')
if cors_origins != '*':
    cors_origins = [origin.strip() for origin in cors_origins.split(',')]

print(f" Starting Queue Service")
print(f"   Environment: {os.environ.get('FLASK_ENV', 'development')}")
print(f"   Port: {os.environ.get('PORT', '4000')}")
print(f"   CORS Origins: {cors_origins}")

CORS(app, resources={
    r"/*": {
        "origins": cors_origins,
        "supports_credentials": True
    }
})

# Register all routes
register_routes(app)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)