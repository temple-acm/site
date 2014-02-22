from django.db import models

# Create your models here.

class Officer(models.Model):

    name = models.CharField(max_length=1000)
    position = models.CharField(max_length=1000)
    image = models.ImageField(upload_to="officer_pics", blank=True)
    bio = models.TextField(max_length=1500)

    def get_image_link(self):
        return self.image.url

    def get_position(self):
        return self.position