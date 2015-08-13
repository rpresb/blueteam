var userData = {};
var ua = navigator.userAgent;
var logger = new Logger("main.js");
var server = "http://10.24.2.145:3000";
var lastId = 0;
var vibrateStack = null;

var device = {
	Android: function() {
	    return /Android/i.test(ua);
	}, BlackBerry: function() {
	    return /BlackBerry/i.test(ua);
	}, iOS: function() {
	    return /iPhone|iPad|iPod/i.test(ua);
	}, Windows: function() {
	    return /IEMobile/i.test(ua);
	}, isAndroid: function() {
	    return (this.Android() && (!this.BlackBerry() && !this.iOS() && !this.Windows()));
	}
};

var doAjax = function(url, type, data, callback) {
	$.ajax({
		url: url,
		type: type,
		data: data,
		dataType: 'json',
		timeout: 3000
	})
	.done(callback)
	.complete(handleErrosOnComplete);
};

var handleErrosOnComplete = function(data, status) {
	switch(data.status) {
		case 0:
			if(data.statusText === "timeout") {
				logger.error("There are some problems to application server responding!");
			} else {
				logger.error("Application cannot respond.");
			}
		break;

		case 500:
		case 503:
			logger.error("Internal Server Error");
		break;

		case 404:
			logger.error("User not found!");
		break;
	}
};

Storage.prototype.setObj = function(key, obj) {
	return this.setItem(key, JSON.stringify(obj));
};

Storage.prototype.getObj = function(key) {
	return JSON.parse(this.getItem(key));
};

var showMessage = function(data) {
	if (lastId != data.id) {
		lastId = data.id;

		data.events.forEach(function (e) {
			switch (e.type) {
				case "color":
					$("body").css("background-color", e.value);
					break;
				case "vibrate":
					vibrateStack = e.value;
					vibrate();
					break;
			}
		});

		$(".main-screen").html(JSON.stringify(data));
	}
}

var vibrate = function() {
	var v = vibrateStack.pop();

	navigator.vibrate(v.time);

	if (vibrateStack.length > 0) {
		setTimeout('vibrate()', v.time + v.delay);
	}
}

$(document).ready(function () {

	var timer = window.setInterval(function() {

		doAjax(server + "/api/messages/receive", "GET", null, showMessage);

	}, 1000);

	logger.info("Hello");
	logger.turnOffDebug();
});
