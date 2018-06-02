(function ($, _) {

var separator = '\n';
var re = /\s$/;
var runtime = _.runtime;

function Strs(prefs) {
	this.length = prefs.length.toString();
	this.order  = prefs.order.join(separator);
}

runtime.sendMessage('get', function (prefs) {
	var strs = new Strs(prefs);
	
	function ready() {
		var form = $.forms['prefs'];
		var length = form['length'];
		var order  = form['order'];
		var ruler   = $.getElementById('ruler');
		var message = $.getElementById('message');
		
		function write(str) {
			if (message.hasChildNodes()) {
				message.appendChild($.createElement('br'));
			}
			message.appendChild($.createTextNode(str));
		}
		var nums;
		function lint(i, line) {
			if (!line) {
				return '空行';
			}
			if (line in nums) {
				return nums[line] + '行目と重複';
			}
			nums[line] = i + 1;
			if (re.test(line)) {
				return '行末に空白';
			}
		}
		function oninput() {
			message.innerHTML = '';
			var lv = length.value, ov = order.value;
			var marks = '';
			
			if (!lv) {
				write('空欄');
			}
			nums = {};
			var lines = ov.split(separator);
			for (var i = 0; i < lines.length; i++) {
				var result = lint(i, lines[i]);
				if (result) {
					write(i + 1 + '行目: ' + result);
				}
				marks += (i + 1 + '\n').slice(-3);
			}
			if (lv != strs.length || ov != strs.order) {
				write('未保存の変更');
			}
			
			ruler.value = marks;
			ruler.style.height = order.clientHeight - 4 + 'px';
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
		
		var width = ruler.clientWidth - 2;
		order.onscroll = function () {
			ruler.scrollTop = this.scrollTop;
			ruler.style.opacity =
				(width - this.scrollLeft) / width;
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
