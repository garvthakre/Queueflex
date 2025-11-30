import grpc
import auth_pb2
import auth_pb2_grpc

CHANNEL = grpc.insecure_channel('localhost:50051')
CLIENT = auth_pb2_grpc.AuthServiceStub(CHANNEL)

def verify_token(token: str):
    request = auth_pb2.VerifyTokenRequest(token=token)
    response = CLIENT.VerifyToken(request)
    return response
