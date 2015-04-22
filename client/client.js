var socket = io('http://graphics.cs.cmu.edu:37018');
var uname = "";
var attrs = [];
var currentAttribute = "";
var choice1;
var choice2;
var loggedIn = false;

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
  $("#pairwise").fadeIn();
  loggedIn = true;
});

socket.on('disconnect', function(socket) {
  loggedIn = false;
});

socket.on('newPair', function(ex1, ex2) {
  choice1 = ex1;
  choice2 = ex2;

  $("#ex1").html('<img src="images/' + ex1 + '.png" class="example left" />');
  $("#ex2").html('<img src="images/' + ex2 + '.png" class="example right" />');
});

socket.on('outOfExamples', function(attribute) {
  $('.prompt').html('No more comparisons needed for this attribute. Please select a new attribute.');
  $("#ex1").html("");
  $("#ex2").html("");
});

function doSetup() {
  socket.emit('getFrontPageData', function(title, msg) {
    $('#titleBar .experimentName').html(title);
    $('#welcomeText').html(msg);
  });
}

function pickOption(optNo) {
  if (optNo == 1) {
    // preferred choice 1 over choice 2
    socket.emit('userSelected', choice1, choice2, currentAttribute);
  }
  else if (optNo == 2) {
    // preferred choice 2 over choice 1
    socket.emit('userSelected', choice2, choice1, currentAttribute);
  }
  // Indifferent option selected?

  socket.emit('getAttributePair', currentAttribute);
}

$(document).ready(function() {
  $("#attributeMenu").hide();
  $("#pairwise").hide();
  $("#attribute").selectmenu();

  $(document).on("keyup", function (e) {
    if (loggedIn) {
      if (e.which == 37) pickOption(1);
      if (e.which == 39) pickOption(2);
    }
  });

  $("#ex1").on("click", function() {
    pickOption(1);
  });

  $("#ex2").on("click", function() {
    pickOption(2);
  })

  $("#attribute").on( "selectmenuchange", function( event, ui ) {
    if (currentAttribute === "") {
      $("#blankAttribute").hide();
      $("#initialPrompt").html("");
    }
    currentAttribute = event.toElement.innerHTML;

    if (currentAttribute === "") {
      // do nothing with the blank attribute.
      return;
    }
    $(".prompt").html('Please click the image that is more "' + currentAttribute + '"');
    socket.emit('getAttributePair', currentAttribute);
  });

  // UI callbacks
  $('#usernameGo').click(function() {
    console.log("Beginning login process");
    uname = $('#username').val();
    socket.emit('login', uname);
  });
})
