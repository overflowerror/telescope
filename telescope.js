var Telescope = function(obj) {
	if (!obj.element)
		throw "No target element given!";
	this.element = obj.element;
	if (!obj.text)
		throw "No text given.";
	this.text = this.parseText(obj.text);
	if (obj.style)
		this.style = obj.style;

	if (obj.flags) {
		this.useStyles = obj.flags & Telescope.USE_STYLES;
	}
}
Telescope.prototype.style = {
	"triggers": {
		"cursor": "pointer",
		"backgroundColor": "#ddd"
	},
	"text": {
		"fontSize": "30px",
		"fontFamily": "Arial"
	}
}
Telescope.USE_STYLES = 1 << 1;
Telescope.prototype.useStyles = false;
Telescope.prototype.text = undefined;
Telescope.prototype.element = undefined;
Telescope.prototype.parseText = function(string) {
	var scope = [];
	
	var tmpObj = {};

	var index = string.indexOf("[");
	while (index >= 0) {
		scope.push(string.substring(0, index));
		string = string.substring(index + 1);

		tmpObj = {
			"trigger": "",
			"sub": []
		}		

		index = string.indexOf("]");

		if (index < 0)
			throw "Syntax Error: ']' expected";

		tmpObj.trigger = string.substring(0, index);
		
		string = string.substring(index + 1);

		var layer = getFirstLayer(string, "{", "}");

		if (!layer)
			throw "Syntax Error: '{' expected";

		scope.push(string.substring(0, layer[0]));	

		var sub = string.substring(layer[0] + 1, layer[1]);		
		string = string.substring(layer[1] + 1);

		tmpObj.sub = this.parseText(sub);

		scope.push(tmpObj);

		index = string.indexOf("[");		
	}
	scope.push(string);

	return scope;
}
Telescope.prototype.display = function() {
	this.element.appendChild(this.generate(this.text, true));
};

Telescope._id = 0;
Telescope.getId = function() {
	return "telescope_id_" + Telescope._id++;
}

Telescope.prototype.generate = function(text, show) {
	var obj = document.createElement("span");
	obj.className = "TelescopeText";
	if (this.useStyles) {		
		for (var attr in this.style.text) {
			obj.style[attr] = this.style.text[attr];
		}
	}
	if (!show)
		obj.style.display = "none";
	for (var i = 0; i < text.length; i++) {
		if ((typeof text[i]) == "string")
			obj.appendChild(document.createTextNode(text[i]));
		else {
			var id = Telescope.getId();
			var trigger = document.createElement("span");
			if (this.useStyles) {		
				for (var attr in this.style.triggers) {
					trigger.style[attr] = this.style.triggers[attr];
				}
			}
			trigger.className = "TelescopeTrigger";	
			trigger.appendChild(document.createTextNode(text[i].trigger));
			trigger.id = id + "_trigger";
			trigger.onclick = function() {
				Telescope.show(this.id.substring(0, this.id.indexOf("_trigger")));
			};
			obj.appendChild(trigger);
			var sub = this.generate(text[i].sub);
			sub.id = id;
			obj.appendChild(sub);
		}
	}

	return obj;
}

Telescope.show = function(id) {
	document.getElementById(id + "_trigger").style.display = "none";
	document.getElementById(id).style.display = "inline";
}

var getFirstLayer = function(string, s, e) {
	var first = -1;

	var ignore = 0;

	for (var i = 0; i < string.length; i++) {
		if (first < 0) {
			if (string.charAt(i) == e)
				throw "Syntax Error: Unexpected '" + e + "'";
			else if (string.charAt(i) == s)
				first = i;
		} else {
			if (string.charAt(i) == s)
				ignore++;
			else if (string.charAt(i) == e)
				ignore--;
			if (ignore < 0)
				return [first, i];
		}
	}
	if (first < 0)
		return undefined;

	throw "Syntax Error: '" + e + "' expected";
}

