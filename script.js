chrome.runtime.sendMessage('get', function (prefs) {
	var order  = prefs.order; 
	var length = prefs.length;
	var orderLength = order.length;
	
	function Item(q) {
		this.text = q.textContent;
		this.href = q.href;
		var index = order.indexOf(this.text);
		this.index = index == -1 ? orderLength : index;
	}
	
	function createQ(item) {
		var a = document.createElement('a');
		a.className = 'q qs';
		a.href = item.href;
		a.textContent = item.text;
		return a;
	}
	
	function main() {
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
		if (selIndex >= length) {
			items.splice(selIndex, 1);
			selIndex = length - 1;
			items.splice(selIndex, 0, selItem);
		}
		
		l = items.length;
		if (length > l) length = l;
		
		vis.innerHTML = more.innerHTML = '';
		for (i = 0; i < length; i++) {
			if (i == selIndex) {
				vis.appendChild(sel);
				continue;
			}
			var div = document.createElement('div');
			div.className = 'hdtb-mitem hdtb-imb';
			div.appendChild(createQ(items[i]));
			vis.appendChild(div);
		}
		for (; i < l; i++) {
			var q = createQ(items[i]);
			q.classList.add('f9UGee');
			more.appendChild(q);
		}
		if (l == length) {
			more.previousSibling.style.display = 'none';
		}
		
		document.body.classList.add('gmf-fixed');
	}
	
	if (document.readyState == 'loading') {
		document.addEventListener('DOMContentLoaded', main);
	} else {
		main();
	}
});
