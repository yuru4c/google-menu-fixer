(function (window, $, _) {
'use strict';

var style = $.createElement('style');
style.type = 'text/css';

function Attribute(name, value) {
	this.name  = name;
	this.value = value;
}

function Element(element, isA) {
	this.tagName = element.tagName;
	this.attributes = [];
	var attributes = element.attributes;
	for (var i = 0, l = attributes.length; i < l; i++) {
		var a = attributes[i];
		var name = a.name;
		if (isA && name == 'href') continue;
		this.attributes.push(new Attribute(name, a.value));
	}
}
Element.prototype.create = function (child) {
	var element = $.createElement(this.tagName);
	for (var i = 0; i < this.attributes.length; i++) {
		var a = this.attributes[i];
		element.setAttribute(a.name, a.value);
	}
	if (child != null) {
		element.appendChild(child);
	}
	return element;
};

function Template(a, ancestors) {
	this.a = new Element(a, true);
	this.ancestors = ancestors;
}
Template.prototype.close = function (a) {
	var element = a;
	for (var i = 0; i < this.ancestors.length; i++) {
		element = this.ancestors[i].create(element);
	}
	return element;
};

function Menu(a, b, ref, parent) {
	var ancestors = [];
	var p = a.parentNode, q = b.parentNode;
	while (p != q) {
		ancestors.push(new Element(p));
		p = p.parentNode;
		q = q.parentNode;
	}
	this.template = new Template(a, ancestors);
	this.element = p;
	this.ref = parent == p ? ref : null;
}
Menu.prototype.append = function (item) {
	this.element.insertBefore(item.get(this.template), this.ref);
};

function Index(a, order) {
	this.a = a;
	var index = order.indexOf(a.textContent);
	this.index = index == -1 ? order.length : index;
}
Index.prototype.get = function () {
	return this.a;
};

function Item(a, order) {
	Index.call(this, a, order);
}
Item.prototype.get = function (template) {
	var a = template.a.create();
	a.href = this.a.href;
	for (; ; ) {
		var child = this.a.firstChild;
		if (child == null) break;
		a.appendChild(child);
	}
	return template.close(a);
};

function compare(x, y) {
	return x.index - y.index;
}

function findSel(menu, as) {
	var children = menu.element.children;
	for (var i = 0; i < as.length; i++) {
		var child = children[i];
		if (!child.contains(as[i])) {
			return child;
		}
	}
}
function removeAll(as, menu, more) {
	var m = menu.element, n = more.element;
	for (var i = 0; i < as.length; i++) {
		for (var a = as[i]; ; ) {
			var parent = a.parentNode;
			if (parent == m || parent == n) {
				parent.removeChild(a);
				break;
			}
			a = parent;
		}
	}
}

function main(ghm, options) {
	var parent = ghm.parentNode;
	var as = parent.querySelectorAll('a[href]');
	var menu = new Menu(as[0], as[1], ghm, parent);
	var more = new Menu(as[as.length - 1], as[as.length - 2]);
	if (menu.element == more.element) {
		return true;
	}
	
	var order  = options.order;
	var length = options.length;
	var i;
	
	var sel = new Index(findSel(menu, as), order);
	var items = [sel];
	for (i = 0; i < as.length; i++) {
		items.push(new Item(as[i], order));
	}
	var l = items.length;
	if (length < l) {
		l = length;
	}
	
	items.sort(compare);
	i = items.indexOf(sel);
	if (i >= length) {
		items.splice(i, 1);
		items.splice(length - 1, 0, sel);
	}
	
	removeAll(as, menu, more);
	for (i = 0; i < l; i++) {
		menu.append(items[i]);
	}
	for (; i < items.length; i++) {
		more.append(items[i]);
	}
	if (l == items.length) {
		ghm.style.display = 'none';
	}
}

function Hide(sheet, selector) {
	this.sheet = sheet;
	this.selector = selector;
	this.hidden = false;
}
Hide.prototype.set = function (hidden) {
	if (hidden) {
		if (!this.hidden) {
			this.sheet.insertRule(this.selector + '{ visibility: hidden; }');
		}
	} else {
		if (this.hidden) {
			this.sheet.deleteRule(0);
		}
	}
	this.hidden = hidden;
};

function test(options, hide) {
	var ghm = $.getElementsByTagName(options.params.tag)[0];
	
	if (main(ghm, options)) {
		hide.set(true);
		
		ghm.addEventListener('DOMNodeInserted', function l(e) {
			this.removeEventListener(e.type, l);
			window.setTimeout(function () {
				main(ghm, options);
				hide.set(false);
			});
		});
	} else {
		hide.set(false);
	}
}

_.runtime.sendMessage('get', function (options) {
	if (options.wait) return;
	var p = options.params;
	
	var sheet = $.head.appendChild(style).sheet;
	if (options.hide) {
		sheet.insertRule(p.followup + '{ display: none !important; }');
	}
	var hide = new Hide(sheet, p.selector);
	
	if ($.readyState == 'loading') {
		hide.set(true);
		
		$.addEventListener('readystatechange', function l(e) {
			this.removeEventListener(e.type, l);
			test(options, hide);
		});
	} else {
		test(options, hide);
	}
});

})(window, document, chrome);
