from django.contrib import admin
from banner.models import Banner

# Register your models here.

class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle',)
    list_filter = ['created']
    date_hierarchy = 'created'

admin.site.register(Banner, BannerAdmin)