# body-vr

Control your [commabody](https://www.comma.ai/shop/body) in VR, with an Oculus headset and controllers. This repo leverages comma's [body-jim](https://github.com/commaai/body-jim), a gymnasium API and [webXR](https://immersiveweb.dev/) on the Oculus Browser.
![Control commabody via Oculus, in VR](./static/display.webp)

## Links
- Blog post: [https://vivekaithal.co/posts/001-bodyvr/](https://vivekaithal.co/posts/001-bodyvr/)


## Usage
```python
WEBRTC_HOST=<ip>:<port> ./serve_https.py
# Note:  Needs comma body on `webrtcd-cors` branch, for now.
```
## Videos

1. Using a previously recorded video as placeholder
<video src='./static/development.mp4' width=720/></video>


2. dcamera and ecamera on the body
<video src='./static/bodycams.mp4' width=720/></video>


3. VR body working!
<video src='./static/vrcams.mp4' width=720/></video>
