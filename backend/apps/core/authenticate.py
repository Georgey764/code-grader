# apps/core/authenticate.py
from django.conf import settings
from rest_framework.authentication import BaseAuthentication


# Inherit from BaseAuthentication to avoid top-level SimpleJWT imports
class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Local import: This is the key to stopping the circular error
        from rest_framework_simplejwt.authentication import JWTAuthentication

        jwt_auth = JWTAuthentication()
        header = jwt_auth.get_header(request)

        if header is None:
            # Check the cookie
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT.get("AUTH_COOKIE"))
        else:
            # Check the header (optional, but good for testing with Postman)
            raw_token = jwt_auth.get_raw_token(header)

        if raw_token is None:
            return None

        try:
            validated_token = jwt_auth.get_validated_token(raw_token)
            return jwt_auth.get_user(validated_token), validated_token
        except Exception:
            return None
