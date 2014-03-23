from .models import Profile
from rest_framework import serializers
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import authenticate
import calendar


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField('get_full_name')

    resume = serializers.SerializerMethodField('get_resume_link')
    image = serializers.SerializerMethodField('get_image_link')
    date_joined_ts = serializers.SerializerMethodField('convert_date_to_timestamp')

    lookup_field = 'username'

    def get_full_name(self, obj):
        return obj.get_full_name()

    def convert_date_to_timestamp(self, obj):
        return calendar.timegm(obj.date_joined.utctimetuple())

    def get_image_link(self, obj):
        try:
            return obj.get_image_link()
        except ValueError:
            return ""

    def get_resume_link(self, obj):
        try:
            return obj.get_resume_link()
        except ValueError:
            return ""

    class Meta:
        model = Profile

        fields = ['username', 'full_name', 'first_name', 'last_name',
            'bio', 'date_joined_ts', 'date_joined', 'github', 'twitter', 'facebook', 'major',
            'year', 'resume', 'image']

        non_native_fields = ('full_name')

        read_only_fields = ('username', 'date_joined',)

class LoginSerializer(serializers.Serializer):
    """
    Provides login capabilities
    """
    username = serializers.CharField()
    password = serializers.CharField()

    def user_credentials(self, attrs):
        """
        Provides credentials for login
        """
        credentials = {}
        credentials['username'] = attrs['username']
        credentials['password'] = attrs['password']
        return credentials

    def validate(self, attrs):
        user = authenticate(**self.user_credentials(attrs))
        if user:
            if user.is_active:
                self.instance = user
            else:
                msg = "User is not active."
                raise serializers.ValidationError(msg)
        else:
            msg = "Authentication unsuccessful"
            raise serializers.ValidationError(msg)


class ProfileCreateSerializer(serializers.ModelSerializer):

    password_confirm = serializers.CharField()

    def validate(self, attrs):
        """
        Validate newly obtained Profile object
        """
        password_confirm = attrs['username']
        password = attrs['username']

        if password_confirm != password:
            raise serializers.ValidationError(_("Password mismatch"))

        return attrs

    class Meta:
        model = Profile
        fields = (
            'username', 'email', 'password',
            'first_name', 'last_name', 'bio', 'github', 'twitter', 
            'facebook','major','year','resume'
            )
        non_native_fields = ('password_confirm',)



