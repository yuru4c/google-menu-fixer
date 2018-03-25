(function () {
	var order = ['すべて', 'ウェブ', '画像', '動画', '地図', 'ニュース', 'ショッピング', '書籍', 'アプリ', 'フライト', 'ファイナンス'];
	var length = order.length, visLength = 5;
	
	function Item(q) {
		this.text = q.textContent;
		this.href = q.href;
		var index = order.indexOf(this.text);
		this.index = index == -1 ? length : index;
	}
	
	function createQ(item) {
		var a = document.createElement('a');
		a.className = 'q qs';
		a.href = item.href;
		a.textContent = item.text;
		return a;
	}
	
	document.addEventListener('DOMContentLoaded', function () {
		var vis = document.getElementById('hdtb-msb-vis');
		var sel = vis.getElementsByClassName('hdtb-msel')[0];
		var qs = vis.parentNode.getElementsByClassName('q qs');
		var i, l = qs.length;
		var more = qs[l - 1].parentNode;
		
		var selItem = new Item(sel);
		var items = [selItem];
		for (i = 0; i < l; i++) items.push(new Item(qs[i]));
		items.sort(function (a, b) {
			return a.index - b.index;
		});
		
		var selIndex = items.indexOf(selItem);
		if (selIndex >= visLength) {
			items.splice(selIndex, 1);
			selIndex = visLength - 1;
			items.splice(selIndex, 0, selItem);
		}
		
		vis.innerHTML = more.innerHTML = '';
		for (i = 0; i < visLength; i++) {
			if (i == selIndex) {
				vis.appendChild(sel);
				continue;
			}
			var div = document.createElement('div');
			div.className = 'hdtb-mitem hdtb-imb';
			div.appendChild(createQ(items[i]));
			vis.appendChild(div);
		}
		for (l = items.length; i < l; i++) {
			var q = createQ(items[i]);
			q.classList.add('f9UGee');
			more.appendChild(q);
		}
		
		document.body.classList.add('gmf-fixed');
	});
})();
