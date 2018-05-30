(function ($, _) {

var separator = '\n';
var runtime = _.runtime;

$.addEventListener('DOMContentLoaded', function () {
	var prefs = $.forms['prefs'];
	var length = prefs['length'];
	var order  = prefs['order'];
	
	function set(items) {
		length.value = items.length;
		order .value = items.order.join(separator);
	}
	runtime.sendMessage('get', set);
	
	prefs.onreset = function () {
		runtime.sendMessage('default', set);
		return false;
	};
	prefs.onsubmit = function () {
		var items = {};
		var ov = order.value, lv = length.value;
		if (ov) items.order  = ov.split(separator);
		if (lv) items.length = +lv;
		runtime.sendMessage(items, function () {
			close();
		});
		return false;
	};
});

})(document, chrome);
