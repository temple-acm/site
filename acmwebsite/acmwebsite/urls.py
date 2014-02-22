from django.conf.urls import patterns, include, url
from django.conf import settings
from rest_framework import routers

from acm_blog import views as blogViews
from banner import views as bannerViews
from users import views as UsersViews
from aboutus import views as aboutUsViews

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()


router = routers.DefaultRouter()
router.register(r'blogs', blogViews.BlogsSet)
router.register(r'banner', bannerViews.BannerSet)
router.register(r'users', UsersViews.UserViewSet, base_name='users')
router.register(r'aboutus', aboutUsViews.OfficersSet)

urlpatterns = patterns('',
    url(r'^$', 'acm_homepage.views.home', name='home'),
    url('^login/', 'django.contrib.auth.views.login', {
          'template_name': 'login/login.html'
        }),
    url(r'^api/', include(router.urls), name='api'),
    # This line enables browseable API auth
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    #url(r'^api/users/(?P<username>.*)$', 'users.views.profile_detail'),
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