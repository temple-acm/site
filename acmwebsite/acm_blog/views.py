# Create your views here.

from acm_blog.models import Post
from .serializers import PostSerializer
from rest_framework import viewsets

class BlogsSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'slug'
