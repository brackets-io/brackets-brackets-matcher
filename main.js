/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

// When code is pasted in the editor, re-indent the changed lines.
define(function (require, exports, module) {
	"use strict";
	
	if (!Array.prototype.includes) {
	  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
		'use strict';
		var O = Object(this);
		var len = parseInt(O.length) || 0;
		if (len === 0) {
		  return false;
		}
		var n = parseInt(arguments[1]) || 0;
		var k;
		if (n >= 0) {
		  k = n;
		} else {
		  k = len + n;
		  if (k < 0) {k = 0;}
		}
		var currentElement;
		while (k < len) {
		  currentElement = O[k];
		  if (searchElement === currentElement ||
			 (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
			return true;
		  }
		  k++;
		}
		return false;
	  };
	}

	var DocumentManger = brackets.getModule("document/DocumentManager"),
		EditorManager = brackets.getModule("editor/EditorManager"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
		prefs = PreferencesManager.getExtensionPrefs("brackets-brackets-matcher");

	// Define the `enabled` preference, default is `true`.
	prefs.definePreference("enabled", "boolean", "true");

	// Re-indent the editor in between specific lines. These are batched into
	// one update.
	function reindentLines(codeMirror, from, to, linesCount) {
		
		var selStartCh = from.ch+1;
		var selEndCh = to.ch;
		if(linesCount === 1) {
			selEndCh += 1;
		}

		codeMirror.doc.setSelection({ line: from.line, ch: selStartCh }, { line: to.line, ch: selEndCh });
	}

	// When the Brackets document changes, attach an event listener for paste
	// events on its internal codeMirror object.
	$(DocumentManger).on("currentDocumentChange", function () {
		var editor = EditorManager.getCurrentFullEditor();

		if (!editor) {
			return;
		}

		var codeMirror = editor._codeMirror;

		// Listen for change events. If this change is not a 'paste', or the
		// extension is disabled, return early.
		codeMirror.on("change", function (codeMirror, change) {
			
			var firstChar = change.text[0][0];
			var lastChar = change.text[change.text.length-1][change.text[change.text.length-1].length-1];
			var firstChars = ['"', "'", "`", "{", "[", "("];
			var lastChars = ['"', "'", "`", "}", "]", ")"];

			if (!prefs.get("enabled") || !firstChars.includes(firstChar) || !lastChars.includes(lastChar)) {
				return;
			}

			var from = change.from;
			var to = change.to;
			var linesCount = change.text.length;

			reindentLines(codeMirror, from, to, linesCount);
		});
	});
});
