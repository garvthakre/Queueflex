from flask import Flask
from flask_cors import CORS
from routes import register_routes

app = Flask(__name__)
CORS(app   , resources={r"/*": {"origins": "http://localhost:3001"}},
    supports_credentials=True)

# Register all routes
register_routes(app)

if __name__ == "__main__":
    app.run(port=5000, debug=True)