import grpc
import sys
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parent
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from proto import auth_pb2, auth_pb2_grpc
from config.config import GRPC_HOST

CHANNEL = grpc.insecure_channel(GRPC_HOST)
CLIENT = auth_pb2_grpc.AuthServiceStub(CHANNEL)


class FailedResponse:
    is_valid = False
    is_admin = False
    user_id = 0


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
        return FailedResponse()