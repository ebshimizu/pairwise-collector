var socket = io('http://localhost');
var uname = "";

socket.on('connect', function(socket) {
  // Fill in required data for initial connection
  doSetup();
});

function doSetup() {
  socket.emit('getFrontPageData', function(title, msg) {
    $('#titleBar .experimentName').html(title);
    $('#welcomeText').html(msg);
  });
}