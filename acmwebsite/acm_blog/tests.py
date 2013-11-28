"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from rest_framework.test import APITestCase
from rest_framework import status
from django.core.urlresolvers import reverse
from django.test import TestCase
from django.contrib.auth.models import User
# from acm_blog.views import views as blogViews

# I desperately need more tests here, but I also don't know how to
# use Django, so I'm not quite sure how to instantiate rich content
# like a blog post to do testing against with a function. 

class BasicReturn (APITestCase):
    def test_blogs_return_always_resolves(self):
        """
        Ensure that a basic return completes. 
        """
        response = self.client.get('/api/blogs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_blog_creation(self):
        """
        Ensure we can make a blog post.
        """
        print User.objects.all()

        data = {'title': 'Test framework test',
                'content': 'This is a test post to test the testing',
                'author': User.objects.get(username='sri')
                }

        self.client.login(username='sri', password='testpass')
        response = self.client.post('/api/blogs/', data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, data)


