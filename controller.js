// Generated by CoffeeScript 1.7.1
(function() {
  "use strict";
  var $, bindButton, clearLog, colorMap, disableButtons, enableButtons, f, flashColor, getNoteCells, key, loadCompString, midiChannel, randomizeTables, rhythm, showError, showUpdate, stopEverything, toArray, ttr, updateButtons, updateTables, updateValues, velocity;

  f = document.forms;

  $ = function(id) {
    return document.getElementById(id);
  };

  ttr = null;

  key = null;

  rhythm = null;

  velocity = null;

  midiChannel = 0;

  colorMap = MusicTheory.Synesthesia.map();

  toArray = function(arr) {
    return Array.prototype.slice.call(arr);
  };

  showError = function(errText) {
    $("errorLog").innerHTML = "Error: " + errText;
    clearTimeout(showError.clock);
    showError.clock = setTimeout((function() {
      return $("errorLog").innerHTML = "";
    }), 2500);
    return false;
  };

  showUpdate = function(updateText) {
    $("updateLog").innerHTML = updateText;
    clearTimeout(showUpdate.clock);
    showUpdate.clock = setTimeout((function() {
      return $("updateLog").innerHTML = "";
    }), 2500);
    return false;
  };

  clearLog = function() {
    $("errorLog").innerHTML = "";
    $("updateLog").innerHTML = "";
    return false;
  };

  stopEverything = function() {
    var i, note, _i, _j, _ref, _results;
    for (i = _i = 0, _ref = setTimeout(";"); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      clearTimeout(i);
    }
    if (MIDI.noteOff) {
      _results = [];
      for (note = _j = 0; _j <= 200; note = ++_j) {
        _results.push(MIDI.noteOff(midiChannel, note, 0));
      }
      return _results;
    }
  };

  randomizeTables = function() {
    stopEverything();
    ttr = ToneRow.consonantRandom();
    return updateTables.apply(null, arguments);
  };

  getNoteCells = function(button) {
    var allRows, buttonIndex, i, length, row, sibling, type, _i, _results;
    type = button.getAttribute("data-type");
    switch (type) {
      case "P":
      case "R":
        row = toArray(button.parentElement.parentElement.childNodes);
        switch (type) {
          case "P":
            return row.slice(3, -3);
          case "R":
            return row.reverse().slice(3, -3);
        }
        break;
      case "I":
      case "RI":
        sibling = button.parentElement;
        buttonIndex = 0;
        while ((sibling = sibling.previousSibling) !== null) {
          buttonIndex++;
        }
        allRows = button.parentElement.parentElement.parentElement.childNodes;
        length = ToneRow.unpack(button.getAttribute("data-row")).length;
        switch (type) {
          case "I":
            _results = [];
            for (i = _i = 0; 0 <= length ? _i <= length : _i >= length; i = 0 <= length ? ++_i : --_i) {
              _results.push(allRows[i + 1].childNodes[buttonIndex + 2]);
            }
            return _results;
          case "RI":
            return ((function() {
              var _j, _results1;
              _results1 = [];
              for (i = _j = 0; 0 <= length ? _j <= length : _j >= length; i = 0 <= length ? ++_j : --_j) {
                _results1.push(allRows[i].childNodes[buttonIndex + 2]);
              }
              return _results1;
            })()).reverse();
        }
        break;
      default:
        return [];
    }
  };

  flashColor = function(color, cell, delay) {
    setTimeout((function() {
      cell.style.background = color;
      return cell.className = "highlighted";
    }), delay * 1000);
    return setTimeout((function() {
      cell.style.transitionProperty = "background";
      cell.style.transitionDuration = "1s";
      cell.style.transitionTimingFunction = "linear";
      cell.style.transitionDelay = 1000;
      cell.style.background = "#fff";
      return cell.className = "";
    }), delay * 1000 + 250);
  };

  bindButton = function(button) {
    return button.onclick = function() {
      var delay, i, note, noteCells, pitch, randomOctaveAdjustment, row, _i, _len, _results;
      row = ToneRow.unpack(this.getAttribute("data-row"));
      noteCells = getNoteCells(button);
      delay = 0;
      _results = [];
      for (i = _i = 0, _len = row.length; _i < _len; i = ++_i) {
        note = row[i];
        pitch = MIDI.pianoKeyOffset + (key + 3) + note + 36;
        randomOctaveAdjustment = (Math.random() < 0.5) * -12;
        flashColor(colorMap[pitch].hex, noteCells[i], delay);
        MIDI.noteOn(midiChannel, pitch + randomOctaveAdjustment, velocity[i % velocity.length], delay);
        _results.push(delay += rhythm[i % rhythm.length] * 2);
      }
      return _results;
    };
  };

  updateTables = function(updateHash) {
    if (updateHash == null) {
      updateHash = true;
    }
    stopEverything();
    updateValues();
    if (updateHash) {
      window.location.hash = ttr.pack();
    }
    $("rowInfo").innerHTML = "Composition <tt> #" + (ttr.pack()) + "</tt>";
    $("nameSuggestion").innerHTML = "“" + (ttr.properName()) + "!”";
    $("numericTable").innerHTML = ttr.numericTable();
    $("chromaticTable").innerHTML = ttr.chromaticTable(key);
    updateButtons();
    return false;
  };

  updateValues = function() {
    var n, rsel;
    key = parseInt(f.options.keySelection.value);
    rsel = f.options.rhythmSelection.selectedOptions[0];
    rhythm = (function() {
      var _i, _len, _ref, _results;
      _ref = rsel.getAttribute("data-rhythm").split(",");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _results.push(parseFloat(n));
      }
      return _results;
    })();
    return velocity = (function() {
      var _i, _len, _ref, _results;
      _ref = rsel.getAttribute("data-velocity").split(",");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        _results.push(parseFloat(n));
      }
      return _results;
    })();
  };

  updateButtons = function() {
    var button, _i, _len, _ref, _results;
    _ref = $("chromaticTable").getElementsByTagName("button");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      button = _ref[_i];
      _results.push(bindButton(button));
    }
    return _results;
  };

  loadCompString = function(compString, verbose) {
    var newTTR;
    if (verbose == null) {
      verbose = false;
    }
    compString = compString.replace(/[#\s]/g, "");
    if (compString.match(/([^a-z0-9]|^$)/)) {
      return showError("Composition must be alphanumeric and nonblank.");
    }
    newTTR = ToneRow.unpack(compString);
    if (newTTR.length !== 12) {
      return showError("Composition must have length of 12.");
    }
    if (!newTTR.isUnique()) {
      return showError("Composition '" + compString + "' is not unique.");
    }
    if (!newTTR.isPerfect()) {
      return showError("Composition '" + compString + "' is imperfect.");
    }
    ttr = newTTR;
    if (verbose) {
      showUpdate("Composition '" + compString + "' loaded!");
    } else {
      clearLog();
    }
    return updateTables();
  };

  disableButtons = function() {
    var button, _i, _len, _ref, _results;
    _ref = document.getElementsByTagName("button");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      button = _ref[_i];
      _results.push(button.disabled = "disabled");
    }
    return _results;
  };

  enableButtons = function() {
    var button, _i, _len, _ref, _results;
    _ref = document.getElementsByTagName("button");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      button = _ref[_i];
      _results.push(button.disabled = "");
    }
    return _results;
  };

  window.onload = function() {
    if (window.location.hash === '') {
      randomizeTables(false);
    } else {
      loadCompString(window.location.hash);
    }
    f.refresh.onsubmit = function() {
      return randomizeTables();
    };
    f.options.keySelection.onchange = updateTables;
    f.options.rhythmSelection.onchange = updateValues;
    f.load.onsubmit = function() {
      return loadCompString(this.loadComposition.value, true);
    };
    window.onhashchange = function() {
      return loadCompString(window.location.hash);
    };
    $("helpOpenLink").onclick = function() {
      $("helpMessage").style.visibility = "visible";
      return false;
    };
    $("helpCloseLink").onclick = function() {
      $("helpMessage").style.visibility = "hidden";
      return false;
    };
    disableButtons();
    return MIDI.loadPlugin({
      soundfontUrl: "./MIDI.js/soundfont/",
      instruments: ["acoustic_grand_piano"],
      callback: function() {
        showUpdate("MIDI soundfont loaded!");
        return enableButtons();
      }
    });
  };

}).call(this);