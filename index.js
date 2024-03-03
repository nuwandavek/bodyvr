import { WebRTCStream, FileStream } from "./streaming.js"
import { runXR } from "./xr.js"


const cameras = ["wideRoad", "driver"]
const video_elements = ["ecamera_video", "dcamera_video"]
/* ==== CHANGE IT TO SWITCH BETWEEN FILE AND STREAM ==== */
const stream_mode = true

var stream = null
if (stream_mode) {
  console.log(`webrtcd url set to /, using webrtcd stream!`)

  stream = new WebRTCStream("", cameras, video_elements);
} else {
  console.log("webrtcd url not set, using file stream!")

  const files = ["static/ecamera.mp4", "static/dcamera.mp4"]
  stream = new FileStream(files, video_elements);
}

runXR(
  function() {
    stream.start().then((answer) => {
      console.log("Stream started with answer", answer);
    });
  },
  function(x, y) {
    const frame = this.counter || 0
    this.counter = frame + 1
    // limit the body joystick updates to every 5 frames
    if (frame % 5 != 0) {
      return
    }

    console.log("controller joystick moved", x, y)
    stream.controlJoystick(x, y)
  }.bind({counter: 0}),
)
