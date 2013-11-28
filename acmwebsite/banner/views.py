from .models import Banner
from .serializers import BannerSerializer
from rest_framework import viewsets

class BannerSet(viewsets.ModelViewSet):
    """
    This will GET up to the last five banner entries.
    It includes a relative link to the image, the text that goes with the image,
    and the date created in case you want to have fun with the ordering. By default,
    it goes most recent to least recent.
    """

    queryset = Banner.objects.all()
    serializer_class = BannerSerializer