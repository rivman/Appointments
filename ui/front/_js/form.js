var datetimepickerOptions = {
	inline: true,
	sideBySide: false,
	format: "YYYY-MM-DD",


	icons: {
		time: "fa fa-clock-o",
		date: "fa fa-calendar",
		up: "fa fa-arrow-up",
		down: "fa fa-arrow-down",

		previous: 'fa fa-chevron-left',
		next: 'fa fa-chevron-right',
		today: 'fa fa-screenshot',
		clear: 'fa fa-trash',
		close: 'fa fa-remove'
	}
};

var tour = new Tour({
	steps: [
		{
			orphan : true,
			title: "Take the tour?",
			content: "the following steps should be self explanitory. if you ever get stuck click the <i class='fa fa-question-circle'></i> icon to bring up the steps tour"
		},
		{
			element: "#mobile_number",
			title: "Enter your mobile number",
			content: "Our highly trained hamsters use this to identify you, maybe 1 day we will teach them the alphabet but for now its numbers only",
			placement:"bottom",
			backdrop:true
		}
	]});





$(document).ready(function () {
	var currenttab = $.bbq.getState("tab") || "tab1";

	//tour.init();
	//tour.start(true);




	//console.log("bbq.getState:"+currenttab);

	$('#wizard-tabs a[href="#' + currenttab + '"]').tab('show')
	$('#rootwizard').bootstrapWizard({
		'show': currenttab,
		'tabClass': 'nav nav-pills',
		'nextSelector': '.button-next',
		'previousSelector': '.button-previous',
		'firstSelector': '.button-first',
		'lastSelector': '.button-last',
		'onTabShow': function (tab, navigation, index) {
			var tabid = $(tab).find("a").attr("href").replace("#", "");



			$.bbq.pushState({"tab": tabid});
			//	console.log("bbq.pushState:"+tabid);

			if (tabid == "tab-confirm") {
				$('#form-footer-other').find("button[type='submit']").attr("disabled", "disabled");
				$("#form-footer-confirm").show();
				$("#form-footer-other").hide();

			} else {
				$('#form-footer-other').find("button[type='submit']").removeAttr("disabled");
				$("#form-footer-confirm").hide();
				$("#form-footer-other").show();
			}




			getSteps()
		},
		'onTabChange':function(){

		}

	});

	$(document).on("submit", "#rootwizard", function (e) {
		e.preventDefault();
		$('#rootwizard').bootstrapWizard('next');



	});
	$(document).on("reset", "#rootwizard", function (e) {
		$(':input', '#rootwizard')
			.not(':button, :submit, :reset, :hidden')
			.val('')
			.removeAttr('checked')
			.removeAttr('selected');

	//	console.log("clear all")

		$('#rootwizard')[0].reset();

		window.location = "?msg=done"


	});


	$(document).on("click", "#move-left", function () {

		var w = $(window).width()
		var leftPos = $('#appointmentDate_day').scrollLeft();
		$('#appointmentDate_day').stop(true, true).animate({scrollLeft: leftPos - (w / 2)}, 800);


	})


	$(document).on("click", "#move-right", function () {
		var w = $(window).width()

		var leftPos = $('#appointmentDate_day').scrollLeft();
		$('#appointmentDate_day').stop(true, true).animate({scrollLeft: leftPos + (w / 2)}, 800);
		console.log(leftPos);
	})




	$(document).on("change", "input.post-data", function () {

		//$('#rootwizard').bootstrapWizard('next');
		getSteps();
		//serviceshighlight();
	})



	$(document).on("click", "#form-footer-confirm .btn.btn-primary", function () {

		var data = $("#confirm-form-area-form").serialize();
		data = data + "&companyID=" + $("#confirm-form-area-form").attr("data-company")
		data = data + "&submit[notes]=" + $("#notes").val();

		var $this = $(this);
		$this.attr("disabled", "disabled");


		$.post("/save/form/form", data, function (data) {
			$this.removeAttr("disabled");
			var data = data.data;


			if (data.errors && ObjectLength(data.errors)) {



				getSteps(true);


				alert("There were errors submitting your booking");

			} else {
				$('#rootwizard').trigger("reset");
				window.location = data.redirect;

			}

		})


	})

	$(document).on("mouseenter",".timeslot",function(){
		var $this = $(this);
		var $panel = $this.closest(".panel");

		$panel.addClass("showing")

		var staff = $(this).attr("data-staff");
		//console.log(staff)
		$(".staff .item.showing",$panel).removeClass("showing");
		if (staff){
			staff = staff.split(",");

			for(var i in staff){

				$(".staff .item[data-id="+staff[i]+"]",$panel.find(".panel-footer")).addClass("showing");
			}

		}
	});

	$(document).on("mouseleave",".timeslot",function(){
		var $this = $(this);
		var $panel = $this.closest(".panel");
		$panel.removeClass("showing")

		showStaff();
	});








	resize();

	$(window).on("resize", function () {
		resize();
	});


});
function showStaff(){
	$("#appointmentDate_time .panel").each(function(){
		var $panel = $(this);
		var $footer = $panel.find(".panel-footer");
		var duration = $panel.attr("data-duration");

		var $timeslots = $panel.find(".timeslots");

		$(".staff .item.showing",$footer).removeClass("showing");

		var staff = $(".selected:first",$timeslots).attr("data-staff")
		//console.log(staff)
		if (staff){
			staff = staff.split(",");


			for(var i in staff){
				$(".staff .item[data-id="+staff[i]+"]",$footer).addClass("showing");
			}

		}

	})

}
function ObjectLength(object) {
	var length = 0;
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			++length;
		}
	}
	return length;
};
function appointmentdayhighlight() {
	//$("label[for='appointmentDate_day-2017-03-18']").find("input").prop("checked",true);
	$("#appointmentDate_day li.active").removeClass("active")
	$("input[name='appointmentDate']").each(function () {
		if ($(this).is(":checked")) {
			var $box = $(this).closest("li");
			$box.addClass("active");
		}
	});


}
function serviceshighlight() {

	$(".panel-service label.active").removeClass("active")

	$("input[class='post-data']:checked",$("#services")).each(function () {
		if ($(this).is(":checked")) {
			$(this).closest("label").addClass("active")
		}
	});



	var duration = 0;
	var count = 0;
	var $label_area = $("#services-selected");
	$("#services  label.active").each(function () {
		var $this = $(this);
		duration = duration + $this.attr("data-duration") * 1;
		count = count + 1;

	});

	$("#duration").val(duration);

	duration = minutes_to_time(duration, true);

	if (count) {
		var lable = '';
		lable += '<div class="row">';
		lable += '	<div class="col-sm-6">';
		lable += '		<span class="ser-foot-heading count">Services </span>';
		lable += '		<span class="ser-foot-value count">' + count + '</span>'
		lable += '	</div>';
		lable += '	<div class="col-sm-6">';
		lable += '		<span class="ser-foot-heading duration">Duration</span>';
		lable += '		<span class="ser-foot-value duration">' + duration + '</span>';
		lable += '	</div>';
		lable += '</div>';

		$("#services-selected").html(lable);
	} else {
		$("#services-selected").html("");
	}


}
function getSteps(jumptofirsterror) {
	var $form = $("#rootwizard")
	var data = $form.serialize();
	//console.log(data);




	data = data + "&companyID=" + $("#confirm-form-area-form").attr("data-company");

	var services = [];
	$("input[class='post-data']:checked",$("#services")).each(function(){
		services.push($(this).val());
	});

	services = (services.join(","));
	//console.log(services);
	if($("#services").length) {
		data = data + "&services="+services;
	}
	//console.info(data);
	var currenttab = $.bbq.getState("tab") || 0;

	$.post("/data/form/data?tab=" + currenttab, data, function (data) {
		data = data.data;
		$("#form-tabs .tab-pane").each(function () {
			var $this = $(this);
			if ($this.attr("data-form")) {
				$this.jqotesub($("#template-" + $this.attr("data-form")), data);
			}
		});

		$("#confirm-form-area-form").jqotesub($("#template-confirm-form-confirm"), data);


		appointmentdayhighlight();

		serviceshighlight();

		var $capturebtn = $("#form-footer-confirm").find(".btn").removeClass("btn-danger").addClass("btn-primary").removeAttr("disabled");


		if (data.errors) {
			var tabs = {};


			var i = 0;
			//console.log(data.errors);
			$(".form-validation", $form).remove();
			var $errorlistarea = $("#error-list-area").html("");
			var errorTabsForAlert = [];
			$.each(data.errors, function (k, v) {
				i = i + 1;
				var $field = $("#" + k);
				//console.info(k)
				var $block = $field.closest(".form-group");

				$block.addClass("has-error");
				if ($field.parent().hasClass("input-group")) $field = $field.parent();


				if (v != "") {

					$field.after('<span class="help-block s form-validation">' + v + '</span>');
				}
				if ($block.hasClass("has-feedback")) {
					$field.after('<span class="fa fa-times form-control-feedback form-validation" aria-hidden="true"></span>')
				}


				$field.each(function () {
					//console.log($(this))
					var tab = $(this).closest(".tab-pane").attr("id");
					if (typeof tabs[tab] == "undefined") {
						tabs[tab] = 0;
					}
					tabs[tab] = (tabs[tab]) + 1;
				});




			});

			$errorlistarea.html(i+" Error(s) found");



			$("#wizard-tabs a").removeClass("label-danger label-success has-error")
			$("#wizard-tabs a .badge").removeClass("label-danger label-success has-error")
//console.info(tabs);
			$("#wizard-tabs a").each(function () {
				var $this = $(this);
				var id = $this.attr("href").replace("#", "");

				if (typeof tabs[id] != "undefined") {
					//console.log(id+" | "+tabs[id])


					$this.addClass("has-error").find(".badge").html('<i class="fa fa-exclamation"></i>').addClass("label label-danger");
				} else {
					$this.find(".badge").html('<i class="fa fa-check"></i>').addClass("label label-success");
				}

			});

			$("#finished-tab").removeClass("label-danger label-success has-error")
			$("#finished-tab .badge").removeClass("label-danger label-success has-error")
			if (i != 0) {
				$capturebtn.addClass("btn-danger").removeClass("btn-primary").attr("disabled", "disabled");
				$("#finished-tab").addClass("has-error").find(".badge").html('<i class="fa fa-exclamation"></i>').addClass("label label-danger")
			} else {
				$("#finished-tab").find(".badge").html('<i class="fa fa-check"></i>').addClass("label label-success");
			}

			$('textarea#notes').summernote({
				minHeight: 200,
				toolbar: [
					['headline', ['style']],
					['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
					['textsize', ['fontsize']],
					['alignment', ['ul', 'ol', 'paragraph', 'lineheight']]
				]
			});


			showStaff();

			var $box = $("#appointmentDate_day li.active");
			var li_items = $box.prevAll("li").length;
			var width = $box.width();
			var offset = width * li_items;


			var parent_width = $("#appointmentDate_day").width();

			var cent_offset =  offset - (parent_width/2) + (width/2);
			if (cent_offset<0)cent_offset=0;
			$('#appointmentDate_day').stop(true, true).animate({scrollLeft: cent_offset}, 0);



			if (jumptofirsterror) {

				$("#wizard-tabs li").each(function () {
					$this = $(this);
					if ($this.find(".badge .fa-exclamation").length) {
						$this.find("a").trigger("click");

						return false;

					}

				})


			}


		}



		resize()
	})
}
function resize() {


	$(".panel-fixed").each(function () {
		var $this = $(this);
		var h = $this.find("> .panel-heading").outerHeight();
		var f = $this.find("> .panel-footer").outerHeight();
		var $body = $this.find("> .panel-body");
		$body.css({top: h, bottom: f});


	});
}