#!/usr/bin/env python3
# WebXR on oculus browser needs https
#
# For some reason this doesn't work with simple http.server from stdlib, so using aiohttp
#

from aiohttp import web
import ssl
import sys
import os

port = 8000
if len(sys.argv) > 1:
  port = int(sys.argv[1])
bind_addr = "0.0.0.0"

os.makedirs("ssl", exist_ok=True)
cert_path = "ssl/cert.pem"
key_path = "ssl/key.pem"
if not os.path.exists(cert_path) or not os.path.exists(key_path):
  exit_code = os.system(f'openssl req -x509 -newkey rsa:4096 -nodes -out {cert_path} -keyout {key_path}\
                        -days 365 -subj "/C=US/ST=California/O=commaai/OU=bodyvr"')
  if exit_code != 0:
    raise ValueError(f"Error creating SSL certificate, exit code: {exit_code}")

ssl_context = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(cert_path, key_path)


async def handle_root(request):
    raise web.HTTPFound('/index.html')

app = web.Application()
app.router.add_get('/', lambda r: web.HTTPFound('/index.html'))
app.router.add_static("/", os.getcwd())
web.run_app(app, access_log=None, host=bind_addr, port=port, ssl_context=ssl_context)
