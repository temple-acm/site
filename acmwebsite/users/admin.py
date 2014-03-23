from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from django.utils.translation import ugettext_lazy as _

from .models import Profile

class ProfileChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = Profile

class ProfileAdmin(UserAdmin):

    fieldsets = (
        (None, {'fields': ('email','username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'position')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        (_('Social Information'), {'fields': ('facebook', 'twitter', 'github', 'bio')}),
        (_('School Information'), {'fields': ('resume', 'major', 'year')}),
    )

    form = ProfileChangeForm

    read_only_fields = ('username', 'last_login', 'date_joined',)

    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'position')

    ordering = ('last_name',)

admin.site.register(Profile, ProfileAdmin)