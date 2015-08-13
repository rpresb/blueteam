var userData = {};
var ua = navigator.userAgent;
var logger = new Logger("main.js");
var server = "http://10.24.2.145:3000";
//var server = "http://192.168.1.35:3000";
var lastId = 0;
var vibrateStack = null;
var timer = null;

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

var vibrationTypes = [
	{
		type: "Coração",
		pattern: [
                { "time": 300, "delay": 50 },
                { "time": 200, "delay": 300 },
                { "time": 300, "delay": 50 },
                { "time": 200, "delay": 300 },
                { "time": 300, "delay": 50 },
                { "time": 200, "delay": 300 },
                { "time": 300, "delay": 50 },
                { "time": 200, "delay": 300 }
		]
	},
	{
		type: "Longa",
		pattern: [
                { "time": 2000, "delay": 0 }
		]
	}
];

var soundCollection = [
	{ type: "Vaca", file: "cow.wav" },
	{ type: "Cachorro", file: "dog.wav" },
	{ type: "Gato", file: "cat.wav" }
];

var presets = [
	{
		name: "default",
		configs: [
			{
				type: "color",
				values: ["#FF0000", "#00FF00", "#0000FF", "#FFCC00"]
			},
			{
				type: "vibrate",
				values: ["Coração", "Longa"]
			},
			{
				type: "sound",
				values: ["Vaca", "Cachorro", "Gato"]
			}
		]

	}
];

var cards = [
	{
		id: 1,
		name: "Porquinho",
		text: "Era uma vez, três porquinhos chamados: Cícero, Heitor e Prático.",
		color: "",
		image: "porquinho.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Casa",
		text: "Um dia, eles resolveram deixar a casa de sua mãe e foram construir suas próprias casas na floresta.",
		image: "casa.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Tijolo",
		text: "O porquinho Prático disse que faria sua casa de tijolos.",
		image: "tijolo.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Tijolo",
		text: "O porquinho Heitor decidiu construir sua casa de madeira",
		image: "madeira.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Palha",
		text: "E o porquinho Cícero decidiu construir sua casa de palha.",
		image: "palha.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Lobo",
		text: "Uma noite, veio um lobo, bateu na casa de palha e queria entrar.",
		image: "lobo.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Vento",
		text: "O porquinho apavorado não abriu a porta. Então o lobo estufou o peito, soprou forte e a casa de palha voou pelos ares.",
		image: "vento.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Porta Fechada",
		text: "Entao, o porquinho correu para a casa de madeira. O lobo chegou e gritou mas ninguém abriu a porta.",
		image: "lobo.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Porta Fechada",
		text: "Então o lobo estufou o peito, soprou forte e a casa de madeira voou pelos ares.",
		image: "vento.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Porta Fechada",
		text: "Os porquinhos correram para a casa de tijolos.",
		image: "tijolo.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},
	{
		id: 2,
		name: "Porta Fechada",
		text: "Como o proquinho Prático era esperto, deixou um caldeirão perto da porta. O lobo correu e caiu dentro do caldeirão com água fervendo e fugiu da casa. E assim, os três porquinhos viveram felizes na casa de tijolos.",
		image: "casa.png",
		vibrate: "Coração",
		sound: "pig.wav"
	},

];

var doAjax = function(url, type, data, callback) {
	$.ajax({
		beforeSend: function(xhrObj) {
		    xhrObj.setRequestHeader("Content-Type","application/json");
		    xhrObj.setRequestHeader("Accept","application/json");
    	},
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
				case "sound":
					playSound(e.value);

					break;
			}
		});
	}
}

var playSound = function(fileName) {
	var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'sound/' + fileName);
    audioElement.setAttribute('autoplay', 'autoplay');

    audioElement.addEventListener("load", function() {
        audioElement.play();
    }, true);
}

var vibrate = function() {
	var v = vibrateStack.pop();

	navigator.vibrate(v.time);

	if (vibrateStack.length > 0) {
		setTimeout('vibrate()', v.time + v.delay);
	}
}

var startTimer = function() {
	timer = window.setInterval(function() {
		doAjax(server + "/api/messages/receive", "GET", null, showMessage);
	}, 1000);
}

var stopTimer = function() {
	window.clearInterval(timer);
	timer = null;
}

var loadPreset = function(preset) {
	var html = "";

	preset.configs.forEach(function (c) {
		switch (c.type) {
			case "color":
				html += "<div class='group'><span>Cor</span>";

				c.values.forEach(function (color) {
					html += "<a class='event color-button' data-value='" + color + "' style='background-color:" + color + "'></a>";
				});

				html += "</div>";

				break;
			case "vibrate":
				html += "<div class='group'><span>Vibrar</span>";

				c.values.forEach(function (vibrate) {
					html += "<a class='event vibrate-button' data-value='" + vibrate + "'>" + vibrate + "</a>";
				});

				html += "</div>";
				
				break;
			case "sound":
				html += "<div class='group'><span>Som</span>";

				c.values.forEach(function (sound) {
					html += "<a class='event sound-button' data-value='" + sound + "'>" + sound + "</a>";
				});

				html += "</div>";

				break;
		}
	});

	html += "<a class='button'>Enviar</a>";

	$(".teacher-screen").html(html);

	$(".event").on('click', function(e) {
		var obj = $(e.target);

		var isSelected = obj.hasClass("selected");

		if (obj.hasClass("color-button")) {
			$(".color-button").removeClass("selected");
		}

		if (obj.hasClass("vibrate-button")) {
			$(".vibrate-button").removeClass("selected");
		}

		if (obj.hasClass("sound-button")) {
			$(".sound-button").removeClass("selected");
		}

		if (!isSelected) {
			obj.addClass("selected");
		}

	});

	$(".button").on('click', function(e) {
		console.log(e);
		sendEvent();
	});
}

var loadCards = function(cards) {
	var html = "";

	cards.forEach(function (c) {

		html += "<div class='group'><p>" + c.text + "</p>";
		if (c.image == "") {
			html += "<a class='event color-button' data-id=" + c.id + " style='background-color:" + c.color + "'></a>";
		}
		else {
			html += "<a class='event color-button' data-id=" + c.id + " style='background: url(img/" + c.image + ")'></a>";
		}

		html += "<div class='clear'></div></div>";

	});

	$(".teacher-screen").html(html);

	$(".event").on('click', function(e) {

		var id = $(e.target).data('id');
		var event = cards[id];
		sendEvent(event);
	});

	// $(".event").on('click', function(e) {
	// 	var obj = $(e.target);

	// 	var isSelected = obj.hasClass("selected");

	// 	if (obj.hasClass("color-button")) {
	// 		$(".color-button").removeClass("selected");
	// 	}

	// 	if (obj.hasClass("vibrate-button")) {
	// 		$(".vibrate-button").removeClass("selected");
	// 	}

	// 	if (!isSelected) {
	// 		obj.addClass("selected");
	// 	}

	// });

	// $(".button").on('click', function(e) {
	// 	sendEvent();
	// });

}

var sendEvent = function(event) {
	//var selectedObjs = $(".selected");
	console.log(event);

	var payload = { id: (new Date()).getTime(), events: null };

	var events = [];

	for (var i = 0; i < selectedObjs.length; i++) {
		var obj = $(selectedObjs.get(i));
		var e = { type: "none" };

		if (obj.hasClass("color-button")) {
			e.type = "color";
			e.value = obj.data("value");
		}

		if (obj.hasClass("vibrate-button")) {
			e.type = "vibrate";

			var pattern = vibrationTypes.filter(function (p) {
				return p.type === obj.data("value");
			});

			if (pattern.length > 0) {
				e.value = pattern[0].pattern;
			}
		}

		if (obj.hasClass("sound-button")) {
			e.type = "sound";

			var sound = soundCollection.filter(function (s) {
				return s.type === obj.data("value");
			});

			if (sound.length > 0) {
				e.value = sound[0].file;
			}
		}

		events.push(e);
	};

	payload.events = events;

	doAjax(server + "/api/messages/send", "POST", JSON.stringify(payload), function(data) {
		$(".button").after("<div class='message'>Enviado com sucesso.</div>");
		setTimeout(function() {
			$("div.message").remove();
		}, 2000);
	});
}

$(document).ready(function () {
	logger.turnOffDebug();

	$(".teacher-screen").hide();
	$(".student-screen").hide();

	$(".teacher-button").on('click', function() {
		$(".chose-screen").hide();
		$(".teacher-screen").show();

		//loadPreset(presets[0]);
		loadCards(cards);
	});

	$(".student-button").on('click', function() {
		$(".chose-screen").hide();
		$(".student-screen").show();

		startTimer();
	});

	$("#btnConfig").on('click', function() {

		if ($(".config").is(":visible")) {
			$(".config").hide();
		} else { 
			$("#serverip").val(server);
			$(".config").show();
		}

	});

	$("#closeConfig").on('click', function() {
		$("#btnConfig").click();
	});

	$("#saveConfig").on('click', function() {
		server = $("#serverip").val();

		$("#btnConfig").click();
	});

});
