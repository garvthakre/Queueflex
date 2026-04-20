import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from routes import register_routes
from config.config import PORT, FLASK_ENV, CORS_ORIGIN

load_dotenv()

app = Flask(__name__)

cors_origins = CORS_ORIGIN
if cors_origins != '*':
    cors_origins = [origin.strip() for origin in cors_origins.split(',')]

print(f" Starting Queue Service")
print(f"   Environment: {FLASK_ENV}")
print(f"   Port: {PORT}")
print(f"   CORS Origins: {cors_origins}")

CORS(app, resources={
    r"/*": {
        "origins": cors_origins,
        "supports_credentials": True
    }
})

register_routes(app)

if __name__ == "__main__":
    debug = FLASK_ENV != 'production'
    app.run(host='0.0.0.0', port=PORT, debug=debug)