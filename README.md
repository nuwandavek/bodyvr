# body-vr

Control your [commabody](https://www.comma.ai/shop/body) in VR, with an Oculus headset and controllers. This repo leverages `webrtcd`, a [webRTC daemon](https://github.com/commaai/openpilot/blob/master/system/webrtc/webrtcd.py) running on the body, and [webXR](https://immersiveweb.dev/) on the Oculus Browser.
![Control commabody via Oculus, in VR](./static/display.webp)

## Links
- Blog post: [https://vivekaithal.co/posts/001-bodyvr/](https://vivekaithal.co/posts/001-bodyvr/)


## Usage
```python
WEBRTC_HOST=<ip>:<port> ./serve_https.py
```
## Videos

1. Using a previously recorded video as placeholder

https://github.com/nuwandavek/bodyvr/assets/20878008/5cee8ab3-38e4-4e2b-b363-2b49a6678538


2. dcamera and ecamera on the body

https://github.com/nuwandavek/bodyvr/assets/1649262/15f3fe96-aff6-43d5-8d22-1940a5a8ccdd


3. VR body working!

https://github.com/nuwandavek/bodyvr/assets/1649262/2ae728f1-a824-4a54-9c13-bf2bca81f42c

