from .models import *
from rest_framework import viewsets, views, exceptions
from .serializers import *
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.authentication import SessionAuthentication
from django.utils.translation import ugettext_lazy as _
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated

from rest_framework.decorators import *



class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows user data to be viewed by username.
    For now, read-only.
    """
    queryset = Profile.objects.all()
    lookup_field = 'username'

    permission_classes = [DjangoModelPermissions]
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        return Response({'detail': 'Query /users/<id>/ for profile information'},
            status=401)

    def retrieve(self, request, username=None):
        user = get_object_or_404(self.queryset, username=username)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)


class AccountCreation(views.APIView):
    """
    API endpoint that allows for account creation. 
    For now, unimplemented pending setup of email 
    backend.
    """
    serializer_class = ProfileCreateSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.DATA)

        # return Response(request.DATA)

        if serializer.is_valid():
            Profile.objects.create_profile(attrs)
            return Response({'detail': _(u'Profile created successfully')}, status=200)

        return Response(serializer.errors, status=400)


class AccountLogin(views.APIView):

    serializer_class = LoginSerializer
    
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.DATA)

        if serializer.is_valid():
            return Response({'detail': _(u'Logged in successfully')}, status=200)

        return Response(serializer.errors, status=401)

    def permission_denied(self, request):
        raise exceptions.PermissionDenied(_("Already authenticated"))

class ProfileDetail(views.APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ProfileSerializer

    queryset = Profile.objects.all()
    def get(self, request, us=None):
        user = get_object_or_404(self.queryset, username=us)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

class OfficersList(views.APIView):
    serializer_class = ProfileSerializer

    def get_queryset(self):
        return sorted(Profile.objects.get(is_staff=True), key=lambda x: ("President" not in x, x))

        def get(self, request, format=None):
            return Response(self.get_queryset())
