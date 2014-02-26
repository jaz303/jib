var S_OUT 			= 'out',
	S_RULE_1 		= 'rule-1',
	S_RULE_2		= 'rule-2',
	S_IN_SCRIPT		= 'script';

var R_TASK 			= /^task\s+(\w+):/,
	R_ASSIGN		= /^([a-zA-Z_][a-zA-Z0-9_]*)\s+([:+]?=)([^$]+)$/,
	R_LEADING_WS	= /^(\s+)([^$]*)$/;

module.exports = function(source) {

	var program		= [];

	var state 		= S_OUT,
		indent 		= [],
		ruleType	= null,
		taskName 	= null,
		lineNumber 	= 0;

	var lines = source.split("\n");
	for (var i = 0; i < lines.length; ++i) {
		
		var line = lines[i].replace(/#[^$]+/, '');
		lineNumber++;

		switch (state) {
			case S_OUT:
				if (line === '') {
					// do nothing
				} else if (line.match(R_TASK)) {
					state = S_RULE_1;
					ruleType = 'task';
					taskName = RegExp.$1;
				} else if (line.match(R_ASSIGN)) {
					program.push({
						type 		: 'assign',
						variable 	: RegExp.$1,
						op 			: RegExp.$2,
						value 		: RegExp.$3.trim()
					});
				} else {
					throw new Error("parse error on line " + lineNumber);
				}
				break;
			case S_RULE_1:
			case S_RULE_2:

				if (state === S_RULE_1) {
					if (!line.match(R_LEADING_WS)) {
						throw new Error("expected indent on line " + lineNumber);
					} else {
						indent.push(RegExp.$1);
					}
				}


				break;
			case S_IN_SCRIPT:
				break;
		}

	}

}