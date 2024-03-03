import { WebRTCStream, FileStream } from "./streaming.js"
import { runXR } from "./xr.js"


const cameras = ["wideRoad", "driver"]
const video_elements = ["ecamera_video", "dcamera_video"]
/* ==== PUT YOUR SERVER URL HERE ==== */
const url = null

var stream = null
if (url) {
  console.log(`webrtcd url set to ${url}, using webrtcd stream!`)

  stream = new WebRTCStream(url, cameras, video_elements);
} else {
  console.log("webrtcd url not set, using file stream!")

  const files = ["static/ecamera.mp4", "static/dcamera.mp4"]
  stream = new FileStream(files, video_elements);
}

runXR(stream);
