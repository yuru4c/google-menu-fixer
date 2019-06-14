(function ($, _) {

var qName = 'q qs';

_.runtime.sendMessage('get', function (prefs) {
	var order  = prefs.order; 
	var length = prefs.length;
	var orderLength = order.length;
	
	function Item(q) {
		this.text = q.textContent;
		this.href = q.href;
		this.children = q.childNodes;
		var index = order.indexOf(this.text);
		this.index = index == -1 ? orderLength : index;
	}
	function createQ(item) {
		var a = $.createElement('a');
		a.className = qName;
		a.href = item.href;
		while (item.children.length) {
			a.appendChild(item.children[0]);
		}
		return a;
	}
	
	function main() {
		var vis = $.getElementById('hdtb-msb-vis');
		var sel = vis.getElementsByClassName('hdtb-msel')[0];
		var qs = vis.parentNode.getElementsByClassName(qName);
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
			var div = $.createElement('div');
			div.className = 'hdtb-mitem hdtb-imb';
			div.appendChild(createQ(items[i]));
			vis.appendChild(div);
		}
		for (; i < l; i++) {
			var q = createQ(items[i]);
			q.className += ' f9UGee';
			more.appendChild(q);
		}
		if (l == length) {
			more.previousSibling.style.display = 'none';
		}
		
		$.body.classList.add('gmf-fixed');
	}
	
	if ($.readyState == 'loading') {
		$.addEventListener('readystatechange', function l(e) {
			this.removeEventListener(e.type, l);
			main();
		});
	} else {
		main();
	}
});

})(document, chrome);
