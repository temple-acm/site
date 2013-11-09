from rest_framework import serializers
from .models import Post
from django.contrib.auth.models import User

class PostSerializer(serializers.HyperlinkedModelSerializer):
    author_name = serializers.Field(source='author.username')

    class Meta:
        model = Post
        fields = ('title', 'author', 'author_name', 'modified', 'content', 'image', 'slug',)