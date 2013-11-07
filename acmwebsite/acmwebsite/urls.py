from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'acm_homepage.views.home', name='home'),
    # url(r'^calendar/', include('acm_calendar.urls', namespace="acm_calendar")),
    url(r'^login/', include('login.urls', namespace="login")),
    # url(r'^acmwebsite/', include('acmwebsite.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^blog/', include('acm_blog.urls', namespace="acm_blog")),
    url(r'^admin/', include(admin.site.urls)),
)
