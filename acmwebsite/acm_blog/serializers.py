from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.HyperlinkedModelSerializer):
    author_name = serializers.Field(source='author.username')

    class Meta:
        model = Post
        fields = ('title', 'modified', 'content', 'image', 'author', 'author_name', 'created', 'slug',)