import grpc
from proto import auth_pb2, auth_pb2_grpc

# Connect to Auth gRPC
CHANNEL = grpc.insecure_channel('localhost:50051')
CLIENT = auth_pb2_grpc.AuthServiceStub(CHANNEL)

def verify_token(token: str):
    """Verify JWT via auth gRPC"""
    print(f"[GRPC CLIENT DEBUG] Calling VerifyToken with token: {token[:50]}...")
    
    try:
        request = auth_pb2.VerifyTokenRequest(token=token)
        response = CLIENT.VerifyToken(request)
        
        print(f"[GRPC CLIENT DEBUG] Response received:")
        print(f"  - is_valid: {response.is_valid}")
        print(f"  - is_admin: {response.is_admin}")
        print(f"  - user_id: {response.user_id}")
        print(f"  - Response type: {type(response)}")
        print(f"  - Response object: {response}")
        
        return response
    except grpc.RpcError as e:
        print(f"[GRPC CLIENT DEBUG] gRPC Error: {e.code()}: {e.details()}")
        
        # Return a failed response object
        class FailedResponse:
            is_valid = False
            is_admin = False
            user_id = 0
        
        return FailedResponse()
    except Exception as e:
        print(f"[GRPC CLIENT DEBUG] Exception: {type(e).__name__}: {str(e)}")
        
        # Return a failed response object
        class FailedResponse:
            is_valid = False
            is_admin = False
            user_id = 0
        
        return FailedResponse()