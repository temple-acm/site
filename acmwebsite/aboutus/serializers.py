from rest_framework import serializers
from .models import Officer

class OfficerSerializer(serializers.HyperlinkedModelSerializer):

    image_link = serializers.CharField(source='get_image_link')

    class Meta:
        model = Officer
        fields = ('name', 'position', 'image_link', 'bio')