"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from django.core.urlresolvers import reverse

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2. I like this, it helps to detect if we have unshielded hardware in space.
        """
        self.assertEqual(1 + 1, 2)

# I desperately need more tests here, but I also don't know how to
# use Django, so I'm not quite sure how to instantiate rich content
# like a blog post to do testing against with a function. 

class ViewTests(TestCase):

    def test_BlogListView_with_no_blogs(self):
        """
        If we have no blogs, display an error message.
        """
        response = self.client.get(reverse('acm_blog:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No blogs are available")
        self.assertQuerySetEqual(response.context['blog_list'], [])
