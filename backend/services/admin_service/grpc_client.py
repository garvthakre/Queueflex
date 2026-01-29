import grpc
import os
from proto import auth_pb2, auth_pb2_grpc

# Configuration from environment variables
GRPC_SERVER_URL = os.getenv("GRPC_SERVER_URL", "localhost:50051")

CHANNEL = grpc.insecure_channel(GRPC_SERVER_URL)
CLIENT = auth_pb2_grpc.AuthServiceStub(CHANNEL)

def verify_token(token: str):
    """Verify JWT via auth gRPC"""
    print(f"[ADMIN GRPC] Calling verify...")
    
    try:
        request = auth_pb2.VerifyTokenRequest(token=token)
        response = CLIENT.VerifyToken(request, timeout=10)
        
        print(f"[ADMIN GRPC] Response: valid={response.is_valid}, admin={response.is_admin}, user={response.user_id}")
        return response
        
    except Exception as e:
        print(f"[ADMIN GRPC] Error: {e}")
        
        class FailedResponse:
            is_valid = False
            is_admin = False
            user_id = 0
        
        return FailedResponse()