(function ($, _) {

function Attribute(name, value) {
	this.name  = name;
	this.value = value;
}

function Element(element, isA) {
	this.tagName = element.tagName;
	this.attributes = [];
	var attributes = element.attributes;
	for (var i = 0; i < attributes.length; i++) {
		var attribute = attributes[i];
		var name = attribute.name;
		if (isA && name == 'href') continue;
		this.attributes.push(new Attribute(name, attribute.value));
	}
}
Element.prototype.create = function (child) {
	var element = $.createElement(this.tagName);
	for (var i = 0; i < this.attributes.length; i++) {
		var attribute = this.attributes[i];
		element.setAttribute(attribute.name, attribute.value);
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

function setStyle(param, hide) {
	var style = $.createElement('style');
	style.type = 'text/css';
	$.head.appendChild(style);
	var sheet = style.sheet;
	
	var selector = param.selector;
	sheet.insertRule(selector + '{ visibility: hidden; }', 0);
	if (hide) {
		var followup = param.followup;
		sheet.insertRule(followup + '{ display: none !important; }', 1);
	}
	return sheet;
}

function findSel(vis, as) {
	var children = vis.childNodes;
	for (var i = 0; i < as.length; i++) {
		var child = children[i];
		if (!child.contains(as[i])) {
			return child;
		}
	}
}
function findLast(vis, as, ghm) {
	var i;
	for (i = 1; i < as.length; i++) {
		if (ghm.contains(as[i])) break;
	}
	for (var a = as[i - 1]; ; ) {
		var parent = a.parentNode;
		if (parent == vis) return a;
		a = parent;
	}
}

function removeAll(as, vis, more) {
	for (var i = 0; i < as.length; i++) {
		for (var a = as[i]; ; ) {
			var parent = a.parentNode;
			if (parent == vis || parent == more) {
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
	
	var sheet = setStyle(param, hide);
	
	function Item(a) {
		this.href = a.href;
		this.children = a.childNodes;
		var index = order.indexOf(a.textContent);
		this.index = index == -1 ? order.length : index;
	}
	Item.prototype.create = function (template) {
		var a = template.a.create();
		a.href = this.href;
		while (this.children.length > 0) {
			a.appendChild(this.children[0]);
		}
		return template.close(a);
	};
	
	function Sort(sel, as) {
		var selItem = new Item(sel);
		var items = [selItem];
		for (var i = 0; i < as.length; i++) {
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
	
	function Vis(a0, a1) {
		this.template = new Template(a0, a1);
		this.element = this.template.parent;
	}
	Vis.prototype.insert = function (item, ref) {
		var element;
		if (item instanceof Item) {
			element = item.create(this.template);
		} else {
			element = item;
		}
		this.element.insertBefore(element, ref);
	};
	
	function main() {
		var ghm = $.getElementsByTagName(param.tag)[0];
		var as = ghm.parentNode.querySelectorAll('a[href]');
		var vis  = new Vis(as[0], as[1]);
		var more = new Vis(as[as.length - 1], as[as.length - 2]);
		var sel  = findSel(vis.element, as);
		var last = findLast(vis.element, as, ghm).nextSibling;
		if (last == sel) last = last.nextSibling;
		
		var sort = new Sort(sel, as);
		var items = sort.items;
		var i;
		
		removeAll(as, vis.element, more.element);
		for (i = 0; i < sort.length; i++) {
			if (i == sort.index) {
				vis.insert(sel, last);
				continue;
			}
			vis.insert(items[i], last);
		}
		for (; i < items.length; i++) {
			more.insert(items[i]);
		}
		if (items.length == sort.length) {
			ghm.style.display = 'none';
		}
		
		sheet.deleteRule(0);
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
