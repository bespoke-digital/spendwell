
from django.contrib.auth import authenticate, login, logout

from rest_framework import status
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        if 'email' not in request.data:
            return Response(
                {'reason': 'email is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if 'password' not in request.data:
            return Response(
                {'reason': 'password is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = request.data['email']
        password = request.data['password']
        user = authenticate(email=email, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({'user': user.as_json()})

        return Response(status=status.HTTP_400_BAD_REQUEST)

login_view = LoginView.as_view()


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response()

logout_view = LogoutView.as_view()


class RefreshView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        if request.user.is_authenticated():
            return Response({'user': request.user.as_json()})
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

refresh_view = RefreshView.as_view()
