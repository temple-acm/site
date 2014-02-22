from django.db import models
from django.utils import timezone
from users.models import Profile
# Create your models here.

class Post(models.Model):
    """
    Stores a single post, related to User objects.
    Everything is built up off of Post objects.
    """

    def __unicode__(self):
        return self.title

    title = models.CharField(max_length=1000)
    author = models.ForeignKey(Profile, related_name='posts')
    created = models.DateTimeField(u'Date Created', blank=False, null=False,
                                   default=timezone.now())
    modified = models.DateTimeField(u'Last Modified', auto_now=True)
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to="uploads", blank=True)
    slug = models.SlugField()