# Create your views here.
# 
from .models import Officer
from .serializers import OfficerSerializer
from rest_framework import viewsets

class OfficersSet(viewsets.ModelViewSet):

    queryset = Officer.objects.all()
    serializer_class = OfficerSerializer
