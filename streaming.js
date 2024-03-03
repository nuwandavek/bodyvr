
export class FileStream {
  constructor(files, videoElements) {
    console.assert(files.length == videoElements.length)

    this.files = files
    this.videoElements = videoElements
  }

  async start() {
    this.files.forEach((file, index) => {
      const videoElement = document.getElementById(this.videoElements[index])
      videoElement.src = file
      videoElement.play()
    })
  }
}

export class WebRTCStream {
  constructor(url, cameras, videoElements) {
    console.assert(cameras.length == videoElements.length)

    this.baseUrl = url
    this.cameras = cameras
    this.videoElements = videoElements
    this.peerConnection = new RTCPeerConnection({sdpSemantics: 'unified-plan'})

    for (let _ of cameras) {
      this.peerConnection.addTransceiver("video", {direction: "recvonly"})
    }
    this.data_channel = this.peerConnection.createDataChannel("data", {ordered: true})

    this.peerConnection.addEventListener("track", this.onTrack.bind(this))
  }

  onTrack(event) {
    if (event.track.kind != "video") {
      return
    }

    console.log("Got video track", event.track.id, event.streams[0].id)
    // FIXME: This doesn't work for now, because of the way browser webRTC implementation hanles msid
    // const parts = event.track.id.split(":")
    // if (parts.length != 2) {
    //   console.log("Invalid track id", event.track.id)
    //   return
    // }
    // const cameraName = parts[0]

    // TODO: This is a hack, which will result in dcamera/ecamera being displayed on invalid video element,
    // we should use the msid attribute of the track, find a way how (manually parse SDP?)
    this.track_count = this.track_count || 0
    const cameraName = this.cameras[this.track_count]
    this.track_count += 1

    this.cameras.forEach((camera, index) => {
      if (camera == cameraName) {
        document.getElementById(this.videoElements[index]).srcObject = event.streams[0]
      }
    })
  }

  async start() {
    var offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)

    console.log("Sending offer", offer)

    const endpointUrl = `${this.baseUrl}/stream`
    const body = {sdp: offer.sdp, cameras: this.cameras, bridge_services_in: ["testJoystick"], bridge_services_out: []}
    const request = await fetch(endpointUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {"Content-Type": "application/json"}
    })
    const responseJson = await request.json()
    const remoteAnswer = {"type": "answer", "sdp": responseJson.sdp}

    console.log("Got remote answer", remoteAnswer)

    await this.peerConnection.setRemoteDescription(remoteAnswer)
    const actualAnswer = this.peerConnection.remoteDescription

    return actualAnswer
  }
}
