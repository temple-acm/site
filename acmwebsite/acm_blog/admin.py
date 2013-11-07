from django.contrib import admin
from acm_blog.models import Post

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created')
    list_filter = ['created']
    search_fields = ['title', 'author']
    date_hierarchy = 'created'
    prepopulated_fields = {'slug': ('title',)}


admin.site.register(Post, PostAdmin)