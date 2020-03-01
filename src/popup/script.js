(function (global, window, $, _) {
'use strict';

var Object = global.Object;
var JSON   = global.JSON;
var runtime = _.runtime;

var SEPARATOR = '\n';
var re = /\s$/;

function Values(options) {
	this.order  = options.order.join(SEPARATOR);
	this.length = options.length.toString();
	this.wait   = options.wait;
	this.hide   = options.hide;
	this.params = JSON.stringify(options.params, null, 2);
}

function Inputs(wait, length, order, hide, params) {
	this.order  = order .value;
	this.length = length.value;
	this.params = params.value;
	this.wait = wait.checked;
	this.hide = hide.checked;
}
Inputs.prototype.isDirty = function (values) {
	for (var key in values) {
		if (this[key] != values[key]) {
			return true;
		}
	}
	return false;
};

function Texts() {
	this.fragment = $.createDocumentFragment();
}
Texts.prototype.writeln = function (str) {
	this.fragment.appendChild($.createTextNode(str));
	this.fragment.appendChild($.createElement('br'));
};

function Linter(lines) {
	this.lines = lines;
	this.nums = Object.create(null);
}
Linter.prototype.read = function (i) {
	var line = this.lines[i];
	
	if (!line) {
		return '空行';
	}
	if (line in this.nums) {
		return this.nums[line] + '行目と重複';
	}
	this.nums[line] = i + 1;
	
	if (re.test(line)) {
		return '行末に空白';
	}
};

function marks(length) {
	var str = '';
	for (var i = 1; i <= length; i++) {
		str += (i + '\n').slice(-3);
	}
	return str;
}

function validate(inputs, lines, values) {
	var texts = new Texts();
	if (!inputs.length) {
		texts.writeln('空欄');
	}
	var linter = new Linter(lines);
	for (var i = 0; i < lines.length; i++) {
		var warn = linter.read(i);
		if (warn) {
			texts.writeln(i + 1 + '行目: ' + warn);
		}
	}
	if (inputs.isDirty(values)) {
		texts.writeln('未保存の変更');
		$.documentElement.className = 'dirty';
	} else {
		$.documentElement.className = '';
	}
	return texts.fragment;
}

function ready(values) {
	var form = $.forms['options'];
	var wait   = form['wait'];
	var length = form['length'];
	var order  = form['order'];
	var hide   = form['hide'];
	var params = form['params'];
	var ruler = $.getElementById('ruler');
	var out   = $.getElementById('out');
	
	var current = 0;
	function oninput() {
		var inputs = new Inputs(wait, length, order, hide, params);
		
		var lines = inputs.order.split(SEPARATOR);
		var l = lines.length;
		if (l != current) {
			ruler.value = marks(l);
			current = l;
		}
		ruler.style.height = order.clientHeight - 4 + 'px';
		
		out.innerHTML = '';
		out.appendChild(validate(inputs, lines, values));
	}
	
	function set(values) {
		wait.checked = values.wait;
		length.value = values.length;
		order.value  = values.order;
		hide.checked = values.hide;
		params.value = values.params;
		oninput();
	}
	function reset(options) {
		set(new Values(options));
	}
	set(values);
	
	order.onscroll = function () {
		ruler.scrollTop = this.scrollTop;
		ruler.style.marginLeft = -this.scrollLeft + 'px';
	};
	form.oninput  = oninput;
	form.onchange = oninput;
	
	form.onreset = function () {
		runtime.sendMessage('default', reset);
		return false;
	};
	form.onsubmit = function () {
		var options = {
			order: order.value.split(SEPARATOR),
			wait: wait.checked,
			hide: hide.checked
		};
		var lv = length.value;
		if (lv) options.length = +lv;
		try {
			options.params = JSON.parse(params.value);
		} catch (e) { }
		
		runtime.sendMessage(options, function () {
			window.close();
		});
		return false;
	};
}

runtime.sendMessage('get', function (options) {
	var values = new Values(options);
	
	if ($.readyState == 'loading') {
		$.addEventListener('readystatechange', function l(e) {
			this.removeEventListener(e.type, l);
			ready(values);
		});
	} else {
		ready(values);
	}
});

})(this, window, document, chrome);
