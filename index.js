var child 	= require('child_process');

var shakefile = require('./jib');

var command = "foobar";

var nextTick = function(cb) { setTimeout(cb, 0); }

function spawn(command, args, flo) {

	var p = child.spawn(command, args, {
		// TODO: env
	});

	p.on('exit', function(status) {
		if (typeof status === 'number') {
			if (status === 0) {
				flo.next();
			} else {
				flo.error(new Error("child exited with status " + status));
			}
		} else {
			flo.error(new Error("child killed by signal " + status));
		}
	});

	p.on('error', function(err) {
		flo.error(err);
	});

	p.stdout.pipe(process.stdout);
	p.stderr.pipe(process.stderr);

	return p;

}

var COMMAND_TYPES = {
	shell: function(command) {
		return function(next, error) {
			spawn(command.command, command.args, {
				next: next,
				error: error
			});
		}
	},
	script: function(command) {
		return function(next, error) {
			var p = spawn(command.interpreter, [], {
				next: next,
				error: error
			});

			p.stdin.write(command.script);
			p.stdin.end();
		}
	}
};

function serialize(runners, cb) {

	var ix = 0;

	function next(err) {
		if (ix === runners.length) {
			cb();
		} else {
			runners[ix++](next, error);
		}
	}

	function error(err) {
		cb(err);
	}

	nextTick(next);

}

function ruleForCommand(command) {
	for (var i = 0; i < shakefile.rules.length; ++i) {
		var rule = shakefile.rules[i];
		if (rule.name === command) {
			return rule;
		}
	}
	return null;
}

function makeRunner(command) {
	return COMMAND_TYPES[command.type](command);
}

function runRule(rule, cb) {
	
	if (!rule)
		cb(new Error("rule not found"));

	serialize(rule.commands.map(makeRunner), cb);

}

var rule = ruleForCommand(command);

runRule(ruleForCommand(command), function(err, res) {
	// 
});
