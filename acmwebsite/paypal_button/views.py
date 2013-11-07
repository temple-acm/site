from django.contrib.auth.decorators import login_required


@login_required
def button_view(request):
    