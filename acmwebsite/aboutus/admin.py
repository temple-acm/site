from django.contrib import admin
from .models import Officer

class OfficerAdmin(admin.ModelAdmin):
    list_display = ('name','position')


admin.site.register(Officer, OfficerAdmin)