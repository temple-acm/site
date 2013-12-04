# Create your views here.

from django.shortcuts import render

def home(request):
	return render(request, 'acm_homepage/homepage.html')

def login(request):
    return render(request, 'login/login.html')