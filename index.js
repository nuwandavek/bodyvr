import { WebRTCStream, FileStream, CompositeStream } from "./streaming.js"
import { runXR } from "./xr.js"


const cameras = ["driver", "wideRoad"]
const video_elements = ["ecamera_video", "dcamera_video"]
/* ==== CHANGE IT TO SWITCH BETWEEN FILE AND STREAM ==== */
fetch('/stream_mode')
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the response body as JSON
  })
  .then(data => {
    var stream = null
    if (data.mode === 'body') {
      console.log(`webrtcd url set to /, using webrtcd stream!`)
      var streams = []
      for (let i = 0; i < cameras.length; i++) {
        const enable_joystick = i === 0
        streams.push(new WebRTCStream("", enable_joystick, [cameras[i]], [video_elements[i]]))
      }
      stream = new CompositeStream(streams);

    } else if (data.mode === 'video') {
      console.log("webrtcd url not set, using file stream!")
      const files = ["static/ecamera.mp4", "static/dcamera.mp4"]
      stream = new FileStream(files, video_elements);
    }

    return stream
  })
  .then(stream => {
    console.log("Starting stream", stream)
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
  })
  .catch(error => {
    console.error('There was a problem with your fetch operation:', error);
  });
