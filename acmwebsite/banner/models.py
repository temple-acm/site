from django.db import models
from django.utils import timezone

# Create your models here.
# 
class Banner(models.Model):
    image = models.ImageField(upload_to="banner_pics", blank=False)
    created = models.DateTimeField(u'Date Created', blank=False, null=False,
                                   default=timezone.now())
    name = models.CharField(max_length=200)
    blurb = models.TextField(max_length=500)

    ordering = ['-created']