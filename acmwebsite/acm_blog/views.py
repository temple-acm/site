# Create your views here.

# from django.conf.urls import patterns, url
from django.views import generic
from acm_blog.models import Post
from django.utils import timezone

from django.shortcuts import get_object_or_404, render

# urlpatterns = patterns('',
#     url(r'^archive/$',
#         ArchiveIndexView.as_view(model=Post, date_field="created"),
#     name="archive"),
# )

class BlogListView(generic.ListView):
    """
    Display a list of :model:`Post` objects, to make up
    a sort of blog homepage view.

    **Template:**
    :template:`acm_blog/all.html`
    """
    model = Post
    template_name = 'acm_blog/all.html'
    context_object_name = 'blog_list'

    def get_queryset(self):
        """Get the last five published blogs."""
        return Post.objects.filter(
            created__lte=timezone.now()
            ).order_by('-created')[:5]


class IndividualBlogView(generic.DetailView):
    model = Post
    template_name = 'acm_blog/post.html'

def index(request):
    blog_list = Post.objects.all().order_by('-created')
    context = {'blog_list': blog_list}
    return render(request, 'acm_blog/all.html', context)

def individualPost(request, slug):
    post = get_object_or_404(Post, slug=slug)
    return render(request, 'acm_blog/post.html', {'Post': post}) ## Not sure about this