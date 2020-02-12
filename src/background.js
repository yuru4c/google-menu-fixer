(function (_) {
'use strict';

var runtime = _.runtime;
var local = _.storage.local;

var keys = {
	order: ['すべて', '画像', '動画', '地図', 'ニュース', '書籍', 'ショッピング', 'フライト', 'ファイナンス'],
	length: 5,
	wait: false,
	hide: false,
	params: {
		followup: '.exp-outline, .AUiS2',
		selector: '#hdtb-msb, .tAcEof',
		tag: 'g-header-menu'
	}
};
var version = 1;

function callback(message, sender, sendResponse) {
	switch (message) {
		case 'get':
		local.get(keys, function (items) {
			sendResponse(items);
		});
		return true;
		
		case 'default':
		sendResponse(keys);
		return;
	}
	local.clear(function () {
		message.version = version;
		local.set(message, function () {
			sendResponse();
		});
	});
	return true;
}

runtime.onInstalled.addListener(function (details) {
	if (details.reason != runtime.OnInstalledReason.UPDATE) return;
	local.get(null, function (items) {
		var key;
		for (key in items) break;
		if (key == null) return;
		
		var v = 'version' in items ? items['version'] : 0;
		if (v != version) {
			items.wait = false;
			items.params = keys.params;
			items.version = version;
			local.set(items);
		}
	});
});
runtime.onMessage.addListener(callback);

})(chrome);
