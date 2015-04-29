$( document ).ready(function() {
	$("#results").imagesLoaded(function() { $("#results").isotope({
		itemSelector: ".item",
		layoutMode: "masonry",
		getSortData: {
			label: "[label] parseFloat",
			pred: "[pred] parseFloat",
			exid: "[exid] pareseInt"
		},
		sortAscending: false,
		sortBy: "pred"
	}); });
	
	$("#sortButtons").buttonset();
	$("#filterButtons").buttonset();
	$("#displayButtons").buttonset();

	$(".id-label").hide();
	$(".label-label").hide();
	$(".pred-label").hide();

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
		$("#results").isotope({ filter: filterVal });
	});

	$("#displayButtons").on( "click", "input", function() {
		var displayVal = $(this).attr("display");
		$(displayVal).toggle();
	});
});