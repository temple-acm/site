from .models import Profile
from rest_framework import serializers
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import authenticate


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField('get_full_name')

    lookup_field = 'username'

    def get_full_name(self, obj):
        return obj.get_full_name()


    class Meta:
        model = Profile
        fields = ['username', 'full_name', 'first_name', 'last_name',
            'bio', 'date_joined', 'github', 'twitter', 'facebook', ]

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
                pass


class ProfileCreateSerializer(serializers.ModelSerializer):

    password_confirm = serializers.CharField()

    def validate_password(self, attrs, source):
        """
        Password confirmation check
        """
        password_confirmation = attrs[source]
        password = attrs['password']

        if password_confirmation != password:
            raise serializers.ValidationError(_("Password mismatch"))

        return attrs

        class Meta:
            fields = (
                'username', 'email', 'password', 'password_confirmation',
                'first_name', 'last_name', 'bio', 'github', 'twitter', 
                'facebook'
                )
            non_native_fields = ('password_confirmation',)

