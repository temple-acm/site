from django.db import models
from django.utils import timezone
import os.path

# Create your models here.
# 
class Banner(models.Model):
    image = models.ImageField(upload_to="banner", blank=False)
    created = models.DateTimeField(u'Date Created', blank=False, null=False,
                                   default=timezone.now())
    title = models.TextField()
    subtitle = models.TextField()

    def get_image_link(self):
        return self.image.url

    ordering = ['-created']