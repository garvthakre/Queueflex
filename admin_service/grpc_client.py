import grpc
from proto import auth_pb2, auth_pb2_grpc

# Connect to Auth gRPC
CHANNEL = grpc.insecure_channel('localhost:50051')
CLIENT = auth_pb2_grpc.AuthServiceStub(CHANNEL)

def verify_token(token: str):
    """Verify JWT via auth gRPC"""
    request = auth_pb2.VerifyTokenRequest(token=token)
    response = CLIENT.VerifyToken(request)
    return response
