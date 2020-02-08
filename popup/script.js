(function (window, $, _) {

var separator = '\n';
var re = /\s$/;
var runtime = _.runtime;

function Values(prefs) {
	this.length = prefs.length.toString();
	this.order  = prefs.order.join(separator);
	this.hide   = prefs.hide;
	try {
		this.param = JSON.stringify(prefs.param, null, 2);
	} catch (e) {
		this.param = '';
	}
}

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
	
	function validate(lv, ov, hc, pv, lines) {
		var texts = new Texts();
		if (!lv) {
			texts.writeln('空欄');
		}
		var linter = new Linter(lines);
		for (var i = 0; i < lines.length; i++) {
			var warn = linter.read(i);
			if (warn) {
				texts.writeln(i + 1 + '行目: ' + warn);
			}
		}
		if (
			lv != values.length ||
			ov != values.order  ||
			hc != values.hide   ||
			pv != values.param)
		{
			texts.writeln('未保存の変更');
		}
		return texts.fragment;
	}
	
	function ready() {
		var form = $.forms['prefs'];
		var length = form['length'];
		var order  = form['order'];
		var hide   = form['hide'];
		var param  = form['json'];
		var ruler = $.getElementById('ruler');
		var out   = $.getElementById('out');
		
		var current = 0;
		function oninput() {
			var lv = length.value;
			var ov = order .value;
			var hc = hide.checked;
			var pv = param.value;
			
			var lines = ov.split(separator);
			var l = lines.length;
			if (l != current) {
				ruler.value = marks(l);
				current = l;
			}
			ruler.style.height = order.clientHeight - 4 + 'px';
			
			out.innerHTML = '';
			out.appendChild(validate(lv, ov, hc, pv, lines));
		}
		
		function set(values) {
			length.value = values.length;
			order .value = values.order;
			hide.checked = values.hide;
			param.value  = values.param;
			oninput();
		}
		function reset(prefs) {
			set(new Values(prefs));
		}
		
		set(values);
		length.oninput  =
		length.onchange = oninput;
		order .oninput  =
		order .onchange = oninput;
		hide  .onclick  = oninput;
		param .oninput  =
		param .onchange = oninput;
		
		order.onscroll = function () {
			ruler.scrollTop = this.scrollTop;
			ruler.style.marginLeft = -this.scrollLeft + 'px';
		};
		
		function select() {
			length.select();
		}
		length.onfocus = function () {
			window.setTimeout(select);
		};
		
		form.onreset = function () {
			runtime.sendMessage('default', reset);
			return false;
		};
		form.onsubmit = function () {
			var prefs = {
				order: order.value.split(separator),
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

})(window, document, chrome);
