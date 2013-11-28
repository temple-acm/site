from rest_framework import serializers
from .models import BannerPicture

class BannerSerializer(serializers.HyperlinkedModelSerializer):

    image_link = "/banner_pics/" + BannerPicture.name

    class Meta:
        model = BannerPicture
        fields = ('image_link', 'created', 'blurb')