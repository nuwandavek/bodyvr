#!/usr/bin/env python3
# WebXR on oculus browser needs https
#
# For some reason this doesn't work with simple http.server from stdlib, so using aiohttp
#

from aiohttp import web
from aiohttp import ClientSession
import ssl
import sys
import os

port = 8000
if len(sys.argv) > 1:
  port = int(sys.argv[1])
bind_addr = "0.0.0.0"

webrtcd_host = os.environ.get("WEBRTCD_HOST", None)

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


async def handle_streaming_mode(request):
  res = {'mode': 'video' if webrtcd_host is None else 'body'}
  return web.json_response(res)

async def handle_stream(request):
  params = await request.text()
  print("Sending offer to webrtcd...")
  webrtcd_url = f"http://{webrtcd_host}/stream"

  async with ClientSession() as session, session.post(webrtcd_url, data=params) as resp:
    assert resp.status == 200
    answer = await resp.json()
    return web.json_response(answer)


async def handle_index(request):
  return web.FileResponse('index.html')

app = web.Application()
app.router.add_get('/', handle_index)
app.router.add_get('/stream_mode', handle_streaming_mode)
app.router.add_post('/stream', handle_stream)
app.router.add_static("/", os.getcwd())
web.run_app(app, access_log=None, host=bind_addr, port=port, ssl_context=ssl_context)
