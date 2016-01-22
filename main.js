/*jslint no-extend-native: false */
/*global define, $, brackets */

define(function () {
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
				if (k < 0) { k = 0; }
			}
			var currentElement;
			while (k < len) {
				currentElement = O[k];
				if (searchElement === currentElement
					|| (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
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

	function selectBetween(codeMirror, from, to, linesCount) {
		
		var selStartCh = from.ch+1;
		var selEndCh = to.ch;
		if(linesCount === 1) {
			selEndCh += 1;
		}

		codeMirror.doc.setSelection({ line: from.line, ch: selStartCh }, { line: to.line, ch: selEndCh });
	}

	$(DocumentManger).on("currentDocumentChange", function () {
		var editor = EditorManager.getCurrentFullEditor();

		if (!editor) {
			return;
		}

		var codeMirror = editor._codeMirror;

		// vv Listen for change events
		codeMirror.on("change", function (codeMirror, change) {
			
			var firstChar = change.text[0][0];
			var lastChar = change.text[change.text.length-1][change.text[change.text.length-1].length-1];
			var firstChars = ['"', "'", "`", "{", "[", "("];
			var lastChars = ['"', "'", "`", "}", "]", ")"];
			
			var index = firstChars.indexOf(firstChar);
			
			if (!prefs.get("enabled") || change.origin === "paste" || change.origin === "undo" || change.origin === "redo"
				|| index < 0 || lastChar !== lastChars[index]) {
				return;
			}

			var from = change.from;
			var to = change.to;
			var linesCount = change.text.length;
			
			selectBetween(codeMirror, from, to, linesCount);
		});
	});
});
