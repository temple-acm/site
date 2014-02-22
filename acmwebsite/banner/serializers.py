from rest_framework import serializers
from .models import Banner

class BannerSerializer(serializers.HyperlinkedModelSerializer):

    image_link = serializers.CharField(source='get_image_link')

    class Meta:
        model = Banner
        fields = ('image_link', 'created', 'title', 'subtitle',)