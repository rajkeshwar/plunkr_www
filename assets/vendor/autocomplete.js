/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define('ace/autocomplete/util', function(require, exports, module) {
"use strict";

exports.parForEach = function(array, fn, callback) {
  var completed = 0;
	var arLength = array.length;
	if (arLength === 0)
		callback();
	for (var i = 0; i < arLength; i++) {
		fn(array[i], function(result, err) {
			completed++;
			if (completed === arLength)
				callback(result, err);
		});
	}
}

var ID_REGEX = /[a-zA-Z_0-9\$]/;

exports.retrievePrecedingIdentifier = function(text, pos, regex) {
    regex = regex || ID_REGEX;
    var buf = [];
    for (var i = pos-1; i >= 0; i--) {
        if (regex.test(text[i]))
            buf.push(text[i]);
        else
            break;
    }
    return buf.reverse().join("");
}

exports.retrieveFollowingIdentifier = function(text, pos, regex) {
    regex = regex || ID_REGEX;
    var buf = [];
    for (var i = pos; i < text.length; i++) {
        if (regex.test(text[i]))
            buf.push(text[i]);
        else
            break;
    }
    return buf;
}

});

/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define('ace/autocomplete/text_completer', function(require, exports, module) {
    var Range = ace.require("ace/range").Range;
    
    var splitRegex = /[^a-zA-Z_0-9\$\-]+/;

    function getWordIndex(doc, pos) {
        var textBefore = doc.getTextRange(Range.fromPoints({row: 0, column:0}, pos));
        return textBefore.split(splitRegex).length - 1;
    }

    // NOTE: Naive implementation O(n), can be O(log n) with binary search
    function filterPrefix(prefix, words) {
        var results = [];
        for (var i = 0; i < words.length; i++) {
            if (words[i].indexOf(prefix) === 0) {
                results.push(words[i]);
            }
        }
        return results;
    }

    /**
     * Does a distance analysis of the word `prefix` at position `pos` in `doc`.
     * @return Map
     */
    function wordDistance(doc, pos) {
        var prefixPos = getWordIndex(doc, pos);
        var words = doc.getValue().split(splitRegex);
        var wordScores = Object.create(null);
        
        var currentWord = words[prefixPos];

        words.forEach(function(word, idx) {
            if (!word || word === currentWord) return;

            var distance = Math.abs(prefixPos - idx);
            var score = words.length - distance;
            if (wordScores[word]) {
                wordScores[word] = Math.max(score, wordScores[word]);
            } else {
                wordScores[word] = score;
            }
        });
        return wordScores;
    }

    exports.getCompletions = function(session, pos, prefix, callback) {
        var wordScore = wordDistance(session, pos, prefix);
        var wordList = filterPrefix(prefix, Object.keys(wordScore));
        callback(null, wordList.map(function(word) {
            return {
                name: word,
                text: word,
                score: wordScore[word],
                meta: "local"
            };
        }));
    };
});

/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define('ace/autocomplete/popup', function(require, exports, module) {
"use strict";

var EditSession = require("../edit_session").EditSession;
var Renderer = require("../virtual_renderer").VirtualRenderer;
var Editor = require("../editor").Editor;
var Range = require("../range").Range;
var event = require("../lib/event");
var lang = require("../lib/lang");
var dom = require("../lib/dom");

var $singleLineEditor = function(el) {
    var renderer = new Renderer(el);

    renderer.maxLines = 4;
    renderer.$computeLayerConfigWithScroll = renderer.$computeLayerConfig;
    renderer.$computeLayerConfig = function() {
        var height = this.session.getScreenLength() * this.lineHeight;
        var maxHeight = this.maxLines * this.lineHeight;
        var desiredHeight = Math.max(this.lineHeight, Math.min(maxHeight, height));
        var vScroll = height > maxHeight;
        if (desiredHeight != this.desiredHeight || vScroll != this.$vScroll) {
            if (vScroll != this.$vScroll) {
                if (vScroll) {
                    this.scrollBar.element.style.display = "";
                    this.scrollBar.width = this.scrollBar.orginalWidth;

                    height = maxHeight;
                    this.scrollTop = height - this.maxLines * this.lineHeight;
                } else {
                    this.scrollBar.element.style.display = "none";
                    this.scrollBar.width = 0;
                }

                this.$size.height = 0;
                this.$size.width = 0;

                this.$vScroll = vScroll;
            }

            this.container.style.height = desiredHeight + "px";
            this.onResize();
            this.$loop.changes = 0;
            this.desiredHeight = desiredHeight;
            this.scroller.style.overflowX="hidden";
        }
        return renderer.$computeLayerConfigWithScroll();
    };

    var editor = new Editor(renderer);

    editor.setHighlightActiveLine(false);
    editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(false);
    editor.renderer.setHighlightGutterLine(false);

    editor.$mouseHandler.$focusWaitTimout = 0;

    return editor;
};

var AcePopup = function(parentNode) {
    var el = dom.createElement("div");
    var popup = new $singleLineEditor(el);
    if (parentNode)
        parentNode.appendChild(el);
    el.style.display = "none";
    popup.renderer.content.style.cursor = "default";
    popup.renderer.setStyle("ace_autocomplete");

    var noop = function(){};

    popup.focus = noop;
    popup.$isFocused = true;

    popup.renderer.$cursorLayer.restartTimer = noop;
    popup.renderer.$cursorLayer.element.style.opacity = 0;

    popup.renderer.maxLines = 8;
    popup.renderer.$keepTextAreaAtCursor = false;

    popup.setHighlightActiveLine(true);
    popup.setSession(new EditSession(""));

    popup.on("mousedown", function(e) {
        var pos = e.getDocumentPosition();
        popup.moveCursorToPosition(pos);
        popup.selection.clearSelection();
        e.stop();
    });

    var hoverMarker = new Range(-1,0,-1,Infinity);
    hoverMarker.id = popup.session.addMarker(hoverMarker, "ace_line-hover", "fullLine");
    popup.on("mousemove", function(e) {
        //if (popup.lastOpened)
        var row = e.getDocumentPosition().row;
        hoverMarker.start.row = hoverMarker.end.row = row;
        popup.session._emit("changeBackMarker");
    });
    var hideHoverMarker = function() {
        hoverMarker.start.row = hoverMarker.end.row = -1;
        popup.session._emit("changeBackMarker");
    };
    event.addListener(popup.container, "mouseout", hideHoverMarker);
    popup.on("hide", hideHoverMarker);
    popup.on("changeSelection", hideHoverMarker);
    popup.on("mousewheel", function(e) {
        setTimeout(function() {
            popup._signal("mousemove", e);
        });
    });

    popup.session.doc.getLength = function() {
        return popup.data.length;
    };
    popup.session.doc.getLine = function(i) {
        var data = popup.data[i];
        if (typeof data == "string")
            return data;
        return (data && data.value) || "";
    };

    var bgTokenizer = popup.session.bgTokenizer;
    bgTokenizer.$tokenizeRow = function(i) {
        var data = popup.data[i];
        var tokens = [];
        if (!data)
            return tokens;
        if (typeof data == "string")
            data = {value: data};

        tokens.push({type: data.className || "", value: data.value});
        if (data.meta) {
            var maxW = popup.renderer.$size.scrollerWidth / popup.renderer.layerConfig.characterWidth;
            if (data.meta.length + data.value.length < maxW - 2)
                tokens.push({type: "rightAlignedText", value: data.meta});
        }
        return tokens;
    };
    bgTokenizer.$updateOnChange = noop;

    // public
    popup.data = [];
    popup.setData = function(list) {
        popup.data = list || [];
        popup.setValue(lang.stringRepeat("\n", list.length), -1);
    };
    popup.getData = function(row) {
        return popup.data[row];
    };

  popup.getRow = function() {
        var line = this.getCursorPosition().row;
        if (line == 0 && !this.getHighlightActiveLine())
            line = -1;
        return line;
    };
    popup.setRow = function(line) {
        popup.setHighlightActiveLine(line != -1);
        popup.selection.clearSelection();
        popup.moveCursorTo(line, 0 || 0);
    };

    popup.setHighlight = function(re) {
        popup.session.highlight(re);
        popup.session._emit("changeFrontMarker");
    };

    popup.hide = function() {
        this.container.style.display = "none";
        this._signal("hide");
    };
    popup.show = function(pos, lineHeight) {
        var el = this.container;
        if (pos.top > window.innerHeight / 2  + lineHeight) {
            el.style.top = "";
            el.style.bottom = window.innerHeight - pos.top + "px";
        } else {
            pos.top += lineHeight;
            el.style.top = pos.top + "px";
            el.style.bottom = "";
        }

        el.style.left = pos.left + "px";
        el.style.display = "";

        this._signal("show");
    };

    return popup;
};

dom.importCssString("\
.ace_autocomplete.ace-tm .ace_marker-layer .ace_active-line {\
    background-color: #abbffe;\
}\
.ace_autocomplete.ace-tm .ace_line-hover {\
    border: 1px solid #abbffe;\
    position: absolute;\
    background: rgba(233,233,253,0.4);\
    z-index: 2;\
    margin-top: -1px;\
}\
.ace_rightAlignedText {\
    color: gray;\
    display: inline-block;\
    position: absolute;\
    right: 4px;\
    text-align: right;\
    z-index: -1;\
}\
.ace_autocomplete {\
    width: 200px;\
    z-index: 200000;\
    background: #f8f8f8;\
    border: 1px lightgray solid;\
    position: fixed;\
    box-shadow: 2px 3px 5px rgba(0,0,0,.2);\
}");

exports.AcePopup = AcePopup;

});

/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define('ace/autocomplete', function(require, exports, module) {
"use strict";

var Range = require("ace/range").Range;
var HashHandler = require("ace/keyboard/hash_handler").HashHandler;
var AcePopup = require("ace/autocomplete/popup").AcePopup;
var util = require("ace/autocomplete/util");
var event = require("ace/lib/event");

var Autocomplete = function() {
    this.keyboardHandler = new HashHandler();
    this.keyboardHandler.bindKeys(this.commands);

    this.$blurListener = this.blurListener.bind(this);
    this.$changeListener = this.changeListener.bind(this);
    this.$mousedownListener = this.mousedownListener.bind(this);
};

(function() {
    this.$init = function() {
        this.popup = new AcePopup(document.body || document.documentElement);
        this.popup.on("click", function(e) {
            this.insertMatch();
            e.stop();
        }.bind(this));
    };

    this.openPopup = function(editor) {
        if (!this.popup)
            this.$init();

        this.popup.setData(this.completions.filtered);

        var renderer = editor.renderer;
        var lineHeight = renderer.layerConfig.lineHeight;
        var pos = renderer.$cursorLayer.getPixelPosition(null, true);
        var rect = editor.container.getBoundingClientRect();
        pos.top += rect.top - renderer.layerConfig.offset;
        pos.left += rect.left;
        pos.left += renderer.$gutterLayer.gutterWidth;

        this.popup.show(pos, lineHeight);

        renderer.updateText();
    };

    this.detach = function() {
        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        this.editor.removeEventListener("changeSelection", this.changeListener);
        this.editor.removeEventListener("blur", this.changeListener);
        this.editor.removeEventListener("mousedown", this.changeListener);

        if (this.popup)
            this.popup.hide();

        this.editor.completer.activated = false;
    };

    this.changeListener = function(e) {
        if (this.editor.completer.activated)
            this.complete(this.editor);
        else
            this.detach();
    };

    this.blurListener = function() {
        if (document.activeElement != this.editor.textInput.getElement())
            this.detach();
    };

    this.mousedownListener = function(e) {
        var mouseX = e.clientX, mouseY = e.clientY;
        var newRow = this.editor.renderer.pixelToScreenCoordinates(mouseX, mouseY).row;
        var currentRow = e.editor.getCursorPosition().row;

        if (newRow !== currentRow) {
            this.detach();
        }
    };

    this.goTo = function(where) {
        var row = this.popup.getRow();
        var max = this.popup.session.getLength() - 1;

        switch(where) {
            case "up": row = row <= 0 ? max : row - 1; break;
            case "down": row = row >= max ? 0 : row + 1; break;
            case "start": row = 0; break;
            case "end": row = max; break;
        }

        this.popup.setRow(row);
    };

    this.insertMatch = function(data) {
        this.detach();
        if (!data)
            data = this.popup.getData(this.popup.getRow());
        if (!data)
            return false;
    		if (data.completer && data.completer.insertMatch) {
    			  data.completer.insertMatch(data);
    		} else {
            data.range = Range.fromPoints(data.range.start, data.range.end);
            this.editor.getSession().replace(data.range, data.value)
      			//this.editor.removeWordLeft();
      			//this.editor.insert(text);
    		}
    };

    this.commands = {
        "Up": function(editor) { editor.completer.goTo("up"); },
        "Down": function(editor) { editor.completer.goTo("down"); },
        "Ctrl-Up|Ctrl-Home": function(editor) { editor.completer.goTo("start"); },
        "Ctrl-Down|Ctrl-End": function(editor) { editor.completer.goTo("end"); },

        "Esc": function(editor) { editor.completer.detach(); },
        "Space": function(editor) { editor.completer.detach(); editor.insert(" ");},
        "Return": function(editor) { editor.completer.insertMatch(); },
        "Shift-Return": function(editor) { editor.completer.insertMatch(true); },
        "Tab": function(editor) { editor.completer.insertMatch(); },

        "PageUp": function(editor) { editor.completer.popup.gotoPageDown(); },
        "PageDown": function(editor) { editor.completer.popup.gotoPageUp(); }
    };

	this.getCompletions = function(editor, callback) {
        var session = editor.getSession();
        var pos = editor.getCursorPosition();

        var line = session.getLine(pos.row);
        var prefix = util.retrievePrecedingIdentifier(line, pos.column);
        
        var matches = [];
        util.parForEach(this.completers, function(completer, next) {
            completer.getCompletions(session, pos, prefix, function(err, results) {
                if (!err)
                    matches = matches.concat(results);
                next();
            });
        }, function() {
            matches.sort(function(a, b) {
                return b.score - a.score;
            });
            callback(null, {
                prefix: prefix,
                matches: matches
            });
        });
        return true;
    };

    this.complete = function(editor) {
        if (this.editor)
            this.detach();

        this.editor = editor;
        if (editor.completer != this) {
            if (editor.completer)
                editor.completer.detach();
            editor.completer = this;
        }

        editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
        editor.on("changeSelection", this.$changeListener);
        editor.on("blur", this.$blurListener);
        editor.on("mousedown", this.$mousedownListener);

        this.getCompletions(this.editor, function(err, results) {
            var matches = results && results.matches;
            if (err || !matches || !matches.length) {
                editor.insert(" ");
      			    
                return this.detach();
      			}
      			//if (matches.length == 1)
      			//	return this.insertMatch(matches[0]);
      
      			this.completions = new FilteredList(matches);
                  this.completions.setFilter(results.prefix);
                  this.openPopup(editor);
    		}.bind(this));
    };
    
    this.cancelContextMenu = function() {
        var stop = function(e) {
            this.editor.off("nativecontextmenu", stop);
            if (e && e.domEvent)
                event.stopEvent(e.domEvent);
        }.bind(this);
        setTimeout(stop, 10);
        this.editor.on("nativecontextmenu", stop);
    };

	this.completers = [];

}).call(Autocomplete.prototype);

Autocomplete.startCommand = {
    name: "startAutocomplete",
    exec: function(editor) {
        if (!editor.completer)
            editor.completer = new Autocomplete();
        editor.completer.complete(editor);
        editor.completer.activated = true;
        // needed for firefox on mac
        editor.completer.cancelContextMenu();
    },
    bindKey: "Ctrl-Space|Shift-Space|Alt-Space"
};
Autocomplete.addTo = function(editor) {
    editor.commands.addCommand(Autocomplete.startCommand);
};

var FilteredList = function(array, mutateData) {
    this.all = array;
    this.filtered = array.concat();
    this.filterText = "";
};
(function(){
    this.setFilter = function(str) {

    };

}).call(FilteredList.prototype);

exports.Autocomplete = Autocomplete;
exports.FilteredList = FilteredList;

});