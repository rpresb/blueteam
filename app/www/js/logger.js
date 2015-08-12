var Logger = function(label) {
	this.label = label;
	this.isDebug = false;
}

Logger.prototype.error = function(str) {
	console.error("Error::", this.label + ":", str);
};

Logger.prototype.warning = function(str) {
	console.warn("Warning::", this.label + ":", str);
};

Logger.prototype.info = function(str) {
	console.info("Info::" + this.label, ":", str);
};

Logger.prototype.debug = function(str) {
	if(this.isDebug) {
		console.debug("Debug::" + this.label, ":", str);
	}
};

Logger.prototype.turnOnDebug = function() {
	this.isDebug = true;
};

Logger.prototype.turnOffDebug = function() {
	this.isDebug = false;
};
