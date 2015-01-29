var socket = io('http://localhost');
var uname = "";
var attrs = [];
var currentAttribute = "";

socket.on('connect', function(socket) {
  // Fill in required data for initial connection
  doSetup();
});

socket.on('initStage', function(attrs) {
  // Hide login stuff.
  $("#welcome").fadeOut();

  // Setup attribute selection menu.
  for (var i = 0; i < attrs.length; i++) {
    $("#attribute").append('<option>' + attrs[i].name + "</option>");
  }

  // Show attributes menu and message to instruct user to pick an attribute.
  $("#attributeMenu").fadeIn();
});

function doSetup() {
  socket.emit('getFrontPageData', function(title, msg) {
    $('#titleBar .experimentName').html(title);
    $('#welcomeText').html(msg);
  });
}0

$(document).ready(function() {
  $("#attributeMenu").hide();
  $("#attribute").selectmenu();

  $("#attribute").on( "selectmenuchange", function( event, ui ) {
    console.log('worked');
  });

  // UI callbacks
  $('#usernameGo').click(function() {
    console.log("Beginning login process");
    uname = $('#username').val();
    socket.emit('login', uname);
  });
})