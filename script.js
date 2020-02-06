(function ($, _) {

var prefix = 'gmf-';

_.runtime.sendMessage('get', function (prefs) {
	var order  = prefs.order;
	var length = prefs.length;
	var hide   = prefs.hide;
	
	function Item(a) {
		this.href = a.href;
		this.children = a.childNodes;
		var index = order.indexOf(a.textContent);
		this.index = index == -1 ? order.length : index;
	}
	Item.prototype.createA = function (className) {
		var a = $.createElement('a');
		a.className = className;
		a.href = this.href;
		while (this.children.length) {
			a.appendChild(this.children[0]);
		}
		return a;
	};
	
	function Sort(sel, as) {
		var selItem = new Item(sel);
		var items = [selItem];
		for (var i = 0, l = as.length; i < l; i++) {
			items.push(new Item(as[i]));
		}
		items.sort(function (a, b) {
			return a.index - b.index;
		});
		
		var index = items.indexOf(selItem);
		if (index >= length) {
			items.splice(index, 1);
			index = length - 1;
			items.splice(index, 0, selItem);
		}
		
		this.items = items;
		this.index = index;
		this.length = length > items.length ?
			items.length : length;
	}
	
	function newer(){
		var vis = $.getElementsByClassName('T47uwc')[0];
		var sel = vis.getElementsByClassName('rQEFy')[0];
		var last = vis.lastChild;
		var as = vis.querySelectorAll('[jsname="ONH4Gc"]');
		var more = as[as.length - 1].parentNode;
		
		var sort = new Sort(sel, as);
		var items = sort.items;
		var i;
		
		for (i = 0; i < as.length; i++) {
			as[i].remove();
		}
		
		var a;
		for (i = 0; i < sort.length; i++) {
			if (i == sort.index) {
				vis.insertBefore(sel, last);
				continue;
			}
			a = items[i].createA('NZmxZe');
			vis.insertBefore(a, last);
		}
		for (; i < items.length; i++) {
			a = items[i].createA('cF4V5c-ibnC6b');
			more.appendChild(a);
		}
		if (items.length == sort.length) {
			more.previousSibling.style.display = 'none';
		}
	}
	function older(vis){
		var qName = 'q qs', moreName = qName + ' f9UGee';
		var sel = vis.getElementsByClassName('hdtb-msel')[0];
		var qs = vis.parentNode.getElementsByClassName(qName);
		var more = qs[qs.length - 1].parentNode;
		
		var sort = new Sort(sel, qs);
		var items = sort.items;
		var i;
		
		vis.innerHTML = more.innerHTML = '';
		
		for (i = 0; i < sort.length; i++) {
			if (i == sort.index) {
				vis.appendChild(sel);
				continue;
			}
			var div = $.createElement('div');
			div.className = 'hdtb-mitem hdtb-imb';
			div.appendChild(items[i].createA(qName));
			vis.appendChild(div);
		}
		for (; i < items.length; i++) {
			var q = items[i].createA(moreName);
			more.appendChild(q);
		}
		if (items.length == sort.length) {
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
