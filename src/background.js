(function (_) {
'use strict';

var keys = {
	order: ['すべて', '画像', '動画', '地図', 'ニュース', '書籍', 'ショッピング', 'フライト', 'ファイナンス'],
	length: 5,
	wait: false,
	hide: false,
	param: {
		followup: '.exp-outline, .AUiS2',
		selector: '#hdtb-msb, .tAcEof',
		tag: 'g-header-menu'
	},
	version: 0
};
var version = 0;
var local = _.storage.local;

_.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	switch (message) {
		case 'get':
		local.get(keys, function (items) {
			var v = items.version;
			if (v != version) {
				items.wait = false;
				items.param = keys.param;
			}
			sendResponse(items);
		});
		return true;
		
		case 'default':
		sendResponse(keys);
		return;
	}
	message.version = version;
	local.clear(function () {
		local.set(message, function () {
			sendResponse();
		});
	});
	return true;
});

})(chrome);
