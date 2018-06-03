(function ($, _) {

var separator = '\n';
var re = /\s$/;
var runtime = _.runtime;

function Strs(prefs) {
	this.length = prefs.length.toString();
	this.order  = prefs.order.join(separator);
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
	for (var i = 1; i < length; i++) {
		str += (i + '\n').slice(-3);
	}
	return str + length;
}

runtime.sendMessage('get', function (prefs) {
	var strs = new Strs(prefs);
	
	function validate(lv, ov, lines, length) {
		var texts = new Texts();
		var linter = new Linter(lines);
		
		if (!lv) {
			texts.writeln('空欄');
		}
		for (var i = 0; i < length; i++) {
			var warn = linter.read(i);
			if (warn) {
				texts.writeln(i + 1 + '行目: ' + warn);
			}
		}
		if (lv != strs.length || ov != strs.order) {
			texts.writeln('未保存の変更');
		}
		return texts.fragment;
	}
	
	function ready() {
		var form = $.forms['prefs'];
		var length = form['length'];
		var order  = form['order'];
		var ruler = $.getElementById('ruler');
		var out   = $.getElementById('out');
		
		var current = 0;
		function oninput() {
			var lv = length.value, ov = order.value;
			var lines = ov.split(separator);
			var l = lines.length;
			
			if (l != current) {
				ruler.value = marks(l);
				current = l;
			}
			ruler.style.height = order.clientHeight - 4 + 'px';
			
			out.innerHTML = '';
			out.appendChild(validate(lv, ov, lines, l));
		}
		
		function set(strs) {
			length.value = strs.length;
			order .value = strs.order;
			oninput();
		}
		function reset(prefs) {
			set(new Strs(prefs));
		}
		
		set(strs);
		length.oninput = oninput;
		order .oninput = oninput;
		
		order.onscroll = function () {
			ruler.scrollTop = this.scrollTop;
			ruler.style.marginLeft = -this.scrollLeft + 'px';
		};
		
		form.onreset = function () {
			runtime.sendMessage('default', reset);
			return false;
		};
		form.onsubmit = function () {
			var prefs = {
				order: order.value.split(separator)
			};
			var lv = length.value;
			if (lv) prefs.length = +lv;
			runtime.sendMessage(prefs, function () {
				close();
			});
			return false;
		};
	}
	
	if ($.readyState == 'loading') {
		$.addEventListener('DOMContentLoaded', ready);
	} else {
		ready();
	}
});

})(document, chrome);
