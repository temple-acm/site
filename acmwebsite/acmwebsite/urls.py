from django.conf.urls import patterns, include, url
from django.conf import settings
from rest_framework import routers

from acm_blog import views as blogViews
from users import views as usersViews

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()


router = routers.DefaultRouter()
router.register(r'blogs', blogViews.BlogsSet)
# router.register(r'blog/getPost/(?P<slug>\w+)/$', blogViews.IndividualBlogView.as_view())
router.register(r'users', usersViews.UserViewSet)
router.register(r'groups', usersViews.GroupViewSet)

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'acm_homepage.views.home', name='home'),
    url('^login/', 'django.contrib.auth.views.login', {
          'template_name': 'login/login.html'
        }),
    # url(r'^calendar/', include('acm_calendar.urls', namespace="acm_calendar")),
    # url(r'^acmwebsite/', include('acmwebsite.foo.urls')),
    url(r'^api/', include(router.urls), name='api'),
    # url(r'api/blog/getPost/(?P<slug>\w+)/$', blogViews.IndividualBlogView.as_view()),
    # This line enables browseable API auth
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

if settings.DEBUG:
    # static files (images, css, javascript, etc.)
    # Make sure that you configure your webserver to serve static
    # files SEPARATELY FROM DJANGO(!!!) when in production.
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT}))