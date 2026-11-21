from django.conf import settings
from django.http import HttpResponsePermanentRedirect


class CanonicalHostMiddleware:
    """Keep the local development site on one canonical origin."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':', 1)[0].lower()
        if host == 'owcus.com' and not settings.DEBUG:
            return HttpResponsePermanentRedirect(f'https://www.owcus.com{request.get_full_path()}')
        if host == 'localhost':
            port = request.get_port()
            host = '127.0.0.1' if port in {'80', '443'} else f'127.0.0.1:{port}'
            return HttpResponsePermanentRedirect(f'http://{host}{request.get_full_path()}')
        return self.get_response(request)
