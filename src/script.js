(function (window, $, _) {
'use strict';

var style = $.createElement('style');
style.type = 'text/css';

function testDisplay(node, value) {
	if (node.nodeType == 1) {
		return window.getComputedStyle(node).display !=
			(value == null ? 'none' : value);
	}
}

function Attribute(attribute) {
	this.name  = attribute.name;
	this.value = attribute.value;
}

function Element(element, ref) {
	this.tagName = element.tagName;
	this.attributes = [];
	var attributes = element.attributes;
	for (var i = 0, l = attributes.length; i < l; i++) {
		var a = new Attribute(attributes[i]);
		if (ref == null || a.value == ref.getAttribute(a.name)) {
			this.attributes.push(a);
		}
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
	this.a = a;
	this.ancestors = ancestors;
}
Template.prototype.close = function (a) {
	var element = a;
	for (var i = 0; i < this.ancestors.length; i++) {
		element = this.ancestors[i].create(element);
	}
	return element;
};

function Menu(a, b, ref) {
	var e = new Element(a, b);
	var ancestors = [];
	var p = a.parentNode, q = b.parentNode, n = null;
	while (p != q) {
		ancestors.push(new Element(p));
		p = p.parentNode;
		q = q.parentNode;
	}
	if (ref != null) {
		for (n = p.lastChild; n != null; n = n.previousSibling) {
			if (n.contains(ref)) break;
		}
	}
	this.template = new Template(e, ancestors);
	this.node = p;
	this.ref = n;
}
Menu.prototype.append = function (item) {
	this.node.insertBefore(item.get(this.template), this.ref);
};

function Show(more, ghm) {
	var node = more.node;
	for (; ; ) {
		var parent = node.parentNode;
		if (parent == ghm) break;
		node = parent;
	}
	this.style = node.style;
	this.cssText = this.style.cssText;
	this.style.display = 'block';
}
Show.prototype.undo = function () {
	this.style.cssText = this.cssText;
};

function Index(a, i, order) {
	this.a = a;
	this.i = i;
	var index = order.indexOf(a.innerText.trim());
	this.index = index == -1 ? order.length : index;
}
Index.prototype.get = function () {
	return this.a;
};

function Item(a, i, order) {
	Index.call(this, a, i, order);
}
Item.prototype.get = function (template) {
	var a = template.a.create();
	a.href = this.a.href;
	for (; ; ) {
		var node = this.a.firstChild;
		if (node == null) break;
		a.appendChild(node);
	}
	return template.close(a);
};

function First(item, more) {
	this.item = item;
	this.styles = $.createDocumentFragment();
	var node = more.node.firstChild;
	for (; node != null; node = node.nextSibling) {
		if (testDisplay(node)) {
			for (node = node.firstChild; node != null; ) {
				var next = node.nextSibling;
				if (node.nodeName == 'STYLE') {
					this.styles.appendChild(node);
				}
				node = next;
			}
			break;
		}
	}
}
First.prototype.get = function (template) {
	var element = this.item.get(template);
	element.insertBefore(this.styles, element.firstChild);
	return element;
};

function compare(x, y) {
	return x.index - y.index || x.i - y.i;
}

function findSel(menu, as, order) {
	var node = menu.node.firstChild;
	for (var i = 0; ; ) {
		if (testDisplay(node)) {
			if (!node.contains(as[i])) {
				return new Index(node, i - 0.5, order);
			}
			i++;
		}
		node = node.nextSibling;
	}
}
function removeAll(as, menu, more) {
	var m = menu.node, n = more.node;
	for (var i = 0; i < as.length; i++) {
		for (var node = as[i]; ; ) {
			var parent = node.parentNode;
			if (parent == m || parent == n) {
				parent.removeChild(node);
				break;
			}
			node = parent;
		}
	}
}

function Main(ghm) {
	this.ghm = ghm;
	var node = ghm.parentNode;
	while (testDisplay(node, 'block')) {
		node = node.parentNode;
	}
	this.node = node;
}
Main.prototype.exec = function (options, hide) {
	var matches = this.node.querySelectorAll('a[href]');
	for (var i = matches.length - 1; i >= 3; i--) {
		if (this.ghm.contains(matches[i])) {
			var as = [];
			for (; i >= 0; i--) {
				as[i] = matches[i];
			}
			hide.set(false);
			this._exec(options.order, options.length, as);
			return true;
		}
	}
};
Main.prototype._exec = function (order, length, as) {
	var i = as.length - 1;
	var menu = new Menu(as[0], as[1], this.ghm);
	var more = new Menu(as[i], as[i - 1]);
	var sel = findSel(menu, as, order);
	var show = new Show(more, this.ghm);
	
	var items = [];
	for (; i >= 0; i--) {
		items[i] = new Item(as[i], i, order);
	}
	var l = items.push(sel);
	i = items.sort(compare).indexOf(sel);
	if (i >= length) {
		items.splice(i, 1);
		items.splice(length - 1, 0, sel);
	}
	
	if (length < l) {
		l = length;
		items[l] = new First(items[l], more);
	}
	show.undo();
	
	removeAll(as, menu, more);
	for (i = 0; i < l; i++) {
		menu.append(items[i]);
	}
	for (; i < items.length; i++) {
		more.append(items[i]);
	}
	if (l == items.length) {
		this.ghm.style.display = 'none';
	}
};

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
	var ghm = $.querySelector(options.params.tag);
	if (ghm == null) {
		hide.set(false);
		return;
	}
	var main = new Main(ghm);
	if (!main.exec(options, hide)) {
		hide.set(true);
		
		ghm.addEventListener('DOMNodeInserted', function l(e) {
			this.removeEventListener(e.type, l);
			window.setTimeout(function () {
				main.exec(options, hide);
			});
		});
	}
}

_.runtime.sendMessage('get', function (options) {
	if (options.wait) return;
	var sheet = $.head.appendChild(style).sheet;
	
	var p = options.params;
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
