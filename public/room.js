// Importing modules
const socket = io("/");
const peer = new Peer(undefined, { host: "/", port: 3001 });

const videoClasses = "rounded-lg shadow-xl border-2 object-cover";

// Add a user video stream to the screen
function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  video.className = videoClasses;
  call.on("stream", (stream) => {
    addVideoStream(video, stream);
  });

  call.on("close", () => video.remove());

  peers[userId] = call;
}

// Adding the video to the screen
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

// Fetching room id using ejs
var roomId = "<%= roomId %>";

// Getting the video grid from DOM
var videoGrid = document.getElementById("videoGrid");

// Connected Peers
const peers = {};

// Setting the root user video
const userVideo = document.createElement("video");
userVideo.className = videoClasses;
userVideo.muted = true;

// Getting the audio video stream from the browser
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    // Checking for the call
    peer.on("call", (call) => {
      // Answering the call
      call.answer(stream);

      // Adding the caller video to the screen
      const callerVideo = document.createElement("video");
      callerVideo.className = videoClasses;
      call.on("stream", (stream) => {
        addVideoStream(callerVideo, stream);
      });

      // Removing the caller from the screen on call disconnect
      call.on("close", () => callerVideo.remove());
    });

    // Adding the user stream to the screen
    addVideoStream(userVideo, stream);
    socket.on("user-connected", (id) => {
      connectToNewUser(id, stream);
    });
  });

// Checking for the peer connection
peer.on("open", (id) => {
  socket.emit("join-room", { userId: id, roomId: roomId });
});

// Handleing user leaving the call
socket.on("user-disconnected", (id) => {
  if (peers[id]) peers[id].close();
});
