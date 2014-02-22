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
    API endpoint that allows users to be viewed by username.
    For now, read-only.
    """
    queryset = Profile.objects.all()
    lookup_field = 'username'

    permission_classes = [DjangoModelPermissions]

    def retrieve(self, request, username=None):
        user = get_object_or_404(self.queryset, username=username)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)


class AccountLogin(views.APIView):

    serializer_class = LoginSerializer
    # permission_classes = (IsNotAuthenticated,)
    
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.DATA)

        if serializer.is_valid():
            login(request, serializer.instance)

            return Response({'detail': _(u'Logged in successfully')}, status=200)

        return Response(serializer.errors, status=400)

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

profile_detail = ProfileDetail.as_view()