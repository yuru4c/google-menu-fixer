(function (global, window, $, _) {
'use strict';

var JSON = global.JSON;

var separator = '\n';
var re = /\s$/;
var runtime = _.runtime;

function Values(prefs) {
	this.order  = prefs.order.join(separator);
	this.length = prefs.length.toString();
	this.wait   = prefs.wait;
	this.hide   = prefs.hide;
	try {
		this.param = JSON.stringify(prefs.param, null, 2);
	} catch (e) {
		this.param = '';
	}
}

function Inputs(wait, length, order, hide, param) {
	this.order  = order .value;
	this.length = length.value;
	this.param  = param .value;
	this.wait   = wait.checked;
	this.hide   = hide.checked;
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
	this.nums = {};
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

runtime.sendMessage('get', function (prefs) {
	var values = new Values(prefs);
	
	function validate(inputs, lines) {
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
	
	function ready() {
		var form = $.forms['prefs'];
		var wait   = form['wait'];
		var length = form['length'];
		var order  = form['order'];
		var hide   = form['hide'];
		var param  = form['json'];
		var ruler = $.getElementById('ruler');
		var out   = $.getElementById('out');
		
		var current = 0;
		function oninput() {
			var inputs = new Inputs(wait, length, order, hide, param);
			
			var lines = inputs.order.split(separator);
			var l = lines.length;
			if (l != current) {
				ruler.value = marks(l);
				current = l;
			}
			ruler.style.height = order.clientHeight - 4 + 'px';
			
			out.innerHTML = '';
			out.appendChild(validate(inputs, lines));
		}
		
		function set(values) {
			wait.checked = values.wait;
			length.value = values.length;
			order.value  = values.order;
			hide.checked = values.hide;
			param.value  = values.param;
			oninput();
		}
		function reset(prefs) {
			set(new Values(prefs));
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
			var prefs = {
				order: order.value.split(separator),
				wait: wait.checked,
				hide: hide.checked
			};
			var lv = length.value;
			if (lv) prefs.length = +lv;
			try {
				prefs.param = JSON.parse(param.value);
			} catch (e) { }
			
			runtime.sendMessage(prefs, function () {
				window.close();
			});
			return false;
		};
	}
	
	if ($.readyState == 'loading') {
		$.addEventListener('readystatechange', function l(e) {
			this.removeEventListener(e.type, l);
			ready();
		});
	} else {
		ready();
	}
});

})(this, window, document, chrome);
