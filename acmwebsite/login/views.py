# Create your views here.
# 
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, HttpResponseRedirect
from django.core.urlresolvers import reverse

def authenticate_user(request):
    """
    Log somebody into the thing.
    """
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('admin:index'))

    auth_form = AuthenticationForm(None, request.POST or None)
    nextpage = request.GET.get('next', reverse('admin:index'))

    if auth_form.is_valid():
        login(request, auth_form.get_user())
        return HttpResponseRedirect(nextpage)

    return render(request, 'login/login.html', {
        'auth_form': auth_form,
        'title': 'Login here please!',
        'next': nextpage,
        })


