from django.db import models
from django.core import validators
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
import re
from django.utils import timezone

# Create your models here.
class Profile(AbstractBaseUser, PermissionsMixin):
    """
    Profile information, basically an extended User object. 
    Field descriptions:

    
    REQUIRED FIELDS:
    username - Username, chosen at registration, used to login. 
    email - user's email, obviously. regex validated using my (maybe someday) patented regex
    first_name - field for user's first name
    last_name - field for user's last name

    OFFICER RELATED FIELDS:
    is_staff - Flag set for people who can log into the admin console, also denotes officers/staff. Checkbox makes it easy to staff/unstaff people.
    position - Field for setting the officer's position
    is_active - Simple flag to denote active/inactive accounts. This way we preserve user data while still removing their ability to do anything 
    date_joined - when they joined. defaults to timezone.now()
    image - Upload an image! for officers, mainly

    SOCIAL MEDIA FIELDS:
    github - User's github account. optional.
    twitter - User's twitter. optional.
    facebook - User's facebook. optional. Who even uses facebook anymore?
    bio - 3000 characters for the user to tell us anything they want to tell us! Also used for officer bios.

    SCHOOL RELATED FIELDS:
    major - User's major, sent back as a standardized string from the client.
    year - User's year of schooling. One of Freshman, Sophomore, Junior, Senior.
    resume - a .doc, .docx, .odt, or .pdf document containing their resume. TODO: file/mimetype checking.
    """

    username = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=False, unique=True,
        validators=[
            validators.RegexValidator(re.compile('^[\w.+]+@[\w]+.[\w.]+'), 'Please enter a valid email address', 'invalid')
        ])
    first_name = models.CharField(max_length=1000, blank=False)
    last_name = models.CharField(max_length=1000, blank=False)


    is_staff = models.BooleanField(default=False, 
        help_text='Designates whether the user can log into this admin site.')
    position = models.TextField(blank=True, 
        help_text = 'Position information for officers. Leave this blank for non-officers.')
    is_active = models.BooleanField(default=True, 
        help_text=('Designates whether this user should be treated as active. Unselect this instead of deleting accounts.'))
    date_joined = models.DateTimeField(default=timezone.now())
    image = models.ImageField(upload_to="officer_pics", blank=True,
        help_text='Pics for officers')

    github = models.CharField(blank=True, max_length=1000)
    twitter = models.CharField(blank=True, max_length=1000)
    facebook = models.CharField(blank=True, max_length=1000)
    bio = models.TextField(blank=True, max_length=3000)

    major = models.TextField(blank=False, max_length=100)
    year = models.TextField(blank=False, max_length=10)

    ## this will be validated by client-side js, in theory
    resume = models.FileField(upload_to="resumes", blank=True)


    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    objects = UserManager()

    def get_resume_link(self):
        return self.resume.url

    def get_short_name(self):
        return self.first_name

    def get_username(self):
        return self.username

    def get_image_link(self):
        return self.image.url

    def get_full_name(self):
        """
        Puts first_name and last_name together to make a full name
        """
        full_name = "%s %s" % (self.first_name, self.last_name)
        return full_name

    def change_password(self, new_password):
        """
        Changes password.
        """
        self.set_password(new_password)
        self.save()

    def create(cls, attrs):
        newProfile = cls(attrs=attrs)
        return newProfile

    def __unicode__(self):
        return self.get_full_name() + ", username " + self.username
