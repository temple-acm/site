from django.conf.urls import patterns, url

from acm_blog import views

urlpatterns = patterns('',
    url(r'^$', views.BlogListView.as_view(), name='index'),
    url(r'^(?P<slug>[\w-]+)', views.IndividualBlogView.as_view(), name='individualPost'),
    )