(function (_) {

var keys = {
	order: ['すべて', '画像', '動画', '地図', 'ニュース', '書籍', 'ショッピング', 'フライト', 'ファイナンス'],
	length: 5
};
var local = _.storage.local;

_.runtime.onMessage.addListener(function(message, sender, sendResponse) {
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
		local.set(message, function () {
			sendResponse();
		});
	});
	return true;
});

})(chrome);
