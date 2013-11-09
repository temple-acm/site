# Create your views here.

from acm_blog.models import Post
from .serializers import PostSerializer
from rest_framework import viewsets

class BlogsSet(viewsets.ModelViewSet):
    """
    This endpoint provides a way to interface against the blogs.
    You can GET the whole listing, paginated in tens, or GET blogs/`slug`
    to retrieve an individual post. 

    Creation is for now unrestricted (all you have to do is login), but that
    will change soon enough.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'slug'
