(function ($) {
	var splitter = '\n';
	var sendMessage = chrome.runtime.sendMessage;
	
	$.addEventListener('DOMContentLoaded', function () {
		var prefs = $.forms['prefs'];
		var length = prefs['length'];
		var order  = prefs['order'];
		
		function set(items) {
			length.value = +items.length;
			order .value = items.order.join(splitter);
		}
		sendMessage('get', set);
		
		prefs.onreset = function () {
			sendMessage('default', set);
			return false;
		};
		prefs.onsubmit = function () {
			var items = {};
			var ov = order.value, lv = length.value;
			if (ov != '') items.order  = ov.split(splitter);
			if (lv != '') items.length = +lv;
			sendMessage(items, function () {
				close();
			});
			return false;
		};
	});
})(document);
