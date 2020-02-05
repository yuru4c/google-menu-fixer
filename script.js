(function ($, _) {

var prefix = 'gmf-';
var qName = 'q qs';

_.runtime.sendMessage('get', function (prefs) {
	var order  = prefs.order;
	var length = prefs.length;
	var hide   = prefs.hide;
	
	function Item(q) {
		this.href = q.href;
		this.children = q.childNodes;
		var index = order.indexOf(q.textContent);
		this.index = index == -1 ? order.length : index;
	}
	Item.compare = function (a, b) {
		return a.index - b.index;
	};
	function createQ(item) {
		var a = $.createElement('a');
		a.className = qName;
		a.href = item.href;
		while (item.children.length) {
			a.appendChild(item.children[0]);
		}
		return a;
	}
	
	function createA(item, className) {
		var a = $.createElement('a');
		a.className = className;
		a.href = item.href;
		while (item.children.length) {
			a.appendChild(item.children[0]);
		}
		return a;
	}
	
	function newer(){
		var vis = $.getElementsByClassName('T47uwc')[0];
		var last = vis.lastChild;
		var sel = vis.getElementsByClassName('rQEFy')[0];
		var qs = $.querySelectorAll('[jsname="ONH4Gc"]');
		var i, l = qs.length;
		var more = qs[l - 1].parentNode;
		
		var selItem = new Item(sel);
		var items = [selItem];
		for (i = 0; i < l; i++) items.push(new Item(qs[i]));
		items.sort(Item.compare);
		
		var selIndex = items.indexOf(selItem);
		if (selIndex >= length) {
			items.splice(selIndex, 1);
			selIndex = length - 1;
			items.splice(selIndex, 0, selItem);
		}
		
		sel.parentNode.removeChild(sel);
		for (i = 0; i < l; i++) {
			var r = qs[i];
			r.parentNode.removeChild(r);
		}
		
		l = items.length;
		if (length > l) length = l;
		
		var a;
		for (i = 0; i < length; i++) {
			if (i == selIndex) {
				vis.insertBefore(sel, last);
				continue;
			}
			a = createA(items[i], 'NZmxZe');
			vis.insertBefore(a, last);
		}
		for (; i < l; i++) {
			a = createA(items[i], 'cF4V5c-ibnC6b');
			more.appendChild(a);
		}
		if (l == length) {
			more.previousSibling.style.display = 'none';
		}
	}
	function older(vis){
		var sel = vis.getElementsByClassName('hdtb-msel')[0];
		var qs = vis.parentNode.getElementsByClassName(qName);
		var i, l = qs.length;
		var more = qs[l - 1].parentNode;
		
		var selItem = new Item(sel);
		var items = [selItem];
		for (i = 0; i < l; i++) items.push(new Item(qs[i]));
		items.sort(Item.compare);
		
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
	}
	
	function main() {
		var classList = $.body.classList;
		if (hide) {
			classList.add(prefix + 'hide');
		}
		
		var vis = $.getElementById('hdtb-msb-vis');
		if (vis == null) {
			newer();
		} else {
			older(vis);
		}
		
		classList.add(prefix + 'fixed');
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
