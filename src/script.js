(function ($, _) {

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

function Template(a0, a1) {
	this.a = new Element(a0, true);
	this.ancestors = [];
	var p = a0.parentNode;
	var q = a1.parentNode;
	while (p != q) {
		this.ancestors.push(new Element(p));
		p = p.parentNode;
		q = q.parentNode;
	}
	this.parent = p;
}
Template.prototype.close = function (a) {
	var element = a;
	for (var i = 0; i < this.ancestors.length; i++) {
		element = this.ancestors[i].create(element);
	}
	return element;
};

function Menu(a0, a1, ref, parent) {
	this.template = new Template(a0, a1);
	this.element = this.template.parent;
	this.ref = parent == this.element ? ref : null;
}
Menu.prototype.append = function (item) {
	var element = item.get(this.template);
	this.element.insertBefore(element, this.ref);
};

function Index(a, order) {
	this.a = a;
	var index = order.indexOf(a.textContent);
	this.index = index == -1 ? order.length : index;
}
Index.prototype.get = function () {
	return this.a;
};

function compare(a, b) {
	return a.index - b.index;
}

function Item(a, order) {
	Index.call(this, a, order);
	var children = a.childNodes;
	this.children = [];
	this.children.length = children.length;
	for (var i = 0; i < this.children.length; i++) {
		this.children[i] = children[i];
	}
}
Item.prototype.get = function (template) {
	var a = template.a.create();
	a.href = this.a.href;
	for (var i = 0; i < this.children.length; i++) {
		a.appendChild(this.children[i]);
	}
	return template.close(a);
};

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

_.runtime.sendMessage('get', function (prefs) {
	if (prefs.wait) return;
	var order  = prefs.order;
	var length = prefs.length;
	var hide   = prefs.hide;
	var param  = prefs.param;
	
	var sheet = $.head.appendChild(style).sheet;
	
	function main() {
		var ghm = $.getElementsByTagName(param.tag)[0];
		var parent = ghm.parentNode;
		var as = parent.querySelectorAll('a[href]');
		var menu = new Menu(as[0], as[1], ghm, parent);
		var more = new Menu(as[as.length - 1], as[as.length - 2]);
		var i;
		
		var sel = new Index(findSel(menu, as), order);
		var items = [sel];
		for (i = 0; i < as.length; i++) {
			items.push(new Item(as[i], order));
		}
		var l = items.length;
		if (length < l) l = length;
		
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
	
	if (hide) {
		sheet.insertRule(param.followup + '{ display: none !important; }');
	}
	
	if ($.readyState == 'loading') {
		sheet.insertRule(param.selector + '{ visibility: hidden; }');
		
		$.addEventListener('readystatechange', function l(e) {
			this.removeEventListener(e.type, l);
			main();
			
			sheet.deleteRule(0);
		});
	} else {
		main();
	}
});

})(document, chrome);
