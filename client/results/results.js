var socket = io("http://graphics.cs.cmu.edu:37019");

$( document ).ready(function() {
	$("#results").imagesLoaded(function() { $("#results").isotope({
		itemSelector: ".item",
		layoutMode: "masonry",
		getSortData: {
			label: "[label] parseFloat",
			pred: "[pred] parseFloat",
			exid: "[exid] pareseInt",
			cmp: function(itemElem) {
				if ($(itemElem).hasClass("compare"))
					return -1;
				else
					return parseInt ($(itemElem).attr("exid"));
			}
		},
		sortAscending: false,
		sortBy: "pred",
		filter: ".test"
	}); });
	
	$("#sortButtons").buttonset();
	$("#filterButtons").buttonset();
	$("#displayButtons").buttonset();
	$("#reset").button();

	$(".id-label").hide();
	$(".label-label").hide();
	$(".pred-label").hide();

	$(".compFor").hide();
	$(".compAgainst").hide();

	$("#sortButtons").on( "click", "input", function() {
		var sortByValue = $(this).attr("data-sort-by");
		if (sortByValue == "id") {
			$("#results").isotope({ sortBy: sortByValue, sortAscending: true })
		}
		else {
			$("#results").isotope({ sortBy: sortByValue, sortAscending: false });
		}
	});

	$("#filterButtons").on( "click", "input", function() {
		var filterVal = $(this).attr("data-filter-by");

		// predicted above threshold
		if (filterVal === "pthresh") {
			var threshold = parseFloat($('#threshold').attr('threshold'));
			$("#results").isotope({ filter: function() {
				var pred = $(this).attr('pred');
				return parseFloat(pred) > threshold;
			}});
		}
		// Actual above threshold
		else if (filterVal === "lthresh") {
			var threshold = parseFloat($('#threshold').attr('threshold'));
			$("#results").isotope({ filter: function() {
				var label = $(this).attr('label');
				return parseFloat(label) > threshold;
			}});
		}
		else {
			$("#results").isotope({ filter: filterVal });
		}
	});

	$("#displayButtons").on( "click", "input", function() {
		var displayVal = $(this).attr("display");
		$(displayVal).toggle();
	});

	$(".item").on("click", function() {
		var id = parseInt($(this).attr("exid"));
		// reset
		$("#results").isotope({ filter: '*' });
		$(".item").removeClass('selected');
		$(".item").removeClass('compare');

		// Add classes for filtering
		$(this).addClass('compare selected');
		
		socket.emit("getComparisons", id, $("body").attr("attr-name"));
	});

	$("#reset").on('click', function() {
		$(".item").removeClass('selected');
		$(".item").removeClass('compare');
		$(".compFor").hide();
		$(".compAgainst").hide();

		$("#test").click();
		$("#pred").click();
	});
});

socket.on('compData', function(x, y, xPy, yPx) {
	xPy = (xPy === null) ? 0 : xPy;
	yPx = (yPx === null) ? 0 : yPx;

	var xstr = "[exid='"+x.toString()+"']";
	var ystr = "[exid='"+y.toString()+"']";

	// Add classes and data to necessary elements
	$(xstr).addClass('selected');
	$(ystr).addClass('selected');
	
	// Add data
	$(xstr + " .compFor").html(xPy);
	$(xstr + " .compAgainst").html(yPx);

	// Note that for the actual id we're comparing we hide this data
	// as the rest of the scenes will have it. It's just easier to do both at once.
	$(ystr + " .compFor").html(yPx);
	$(ystr + " .compAgainst").html(xPy);
});

socket.on('compDataComplete', function(id) {
	$(".compFor").show();
	$(".compAgainst").show();

	var idstr = "[exid='"+id+"']";

	$(idstr + " .compFor").hide();
	$(idstr + " .compAgainst").hide();

	$("#results").isotope({ filter: '.selected', sortBy: 'cmp', sortAscending: true });
});