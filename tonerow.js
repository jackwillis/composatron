// Generated by CoffeeScript 1.7.1
(function() {
  "use strict";
  var RandomNumberGenerator, ToneRow, consonantIntervals, mod,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mod = function(n, period) {
    return ((n % period) + period) % period;
  };

  Array.prototype.shuffle = function() {
    var i, n, tmp;
    n = this.length;
    while (n--) {
      i = Math.floor(Math.random() * n);
      tmp = this[i];
      this[i] = this[n];
      this[n] = tmp;
    }
    return this;
  };

  RandomNumberGenerator = (function() {
    var a, b, c;

    function RandomNumberGenerator(seed) {
      this.seed = seed != null ? seed : 6;
    }

    a = 9301;

    b = 49297;

    c = 233280.0;

    RandomNumberGenerator.prototype.random = function(max, min) {
      if (max == null) {
        max = 1;
      }
      if (min == null) {
        min = 0;
      }
      this.seed = (this.seed * a + b) % c;
      return min + (this.seed / c) * (max - min);
    };

    return RandomNumberGenerator;

  })();

  this["ToneRow"] = ToneRow = (function(_super) {
    var ends, infixes, scale, starts, vowels;

    __extends(ToneRow, _super);

    function ToneRow(list) {
      var n;
      if (list == null) {
        list = [];
      }
      this.replace(list);
      this.replace((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          n = this[_i];
          _results.push(mod(n, 12));
        }
        return _results;
      }).call(this));
    }

    ToneRow.prototype.replace = function(other) {
      this.length = 0;
      return this.push.apply(this, other);
    };

    ToneRow.prototype.equals = function(other) {
      return !(this < other || other < this);
    };

    ToneRow.prototype.compareFirstNote = function(other) {
      return this[0] > other[0];
    };

    ToneRow.prototype.compareLastNote = function(other) {
      return this.slice(-1)[0] > other.slice(-1)[0];
    };

    ToneRow.prototype.isUnique = function() {
      var i, n;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (n = _i = 0, _len = this.length; _i < _len; n = ++_i) {
          i = this[n];
          if (this.indexOf(i) === n) {
            _results.push(i);
          }
        }
        return _results;
      }).call(this)).length === this.length;
    };

    ToneRow.prototype.isPerfect = function() {
      return this.isUnique() && this.inversion().isUnique();
    };

    ToneRow.prototype.add = function(addend) {
      var n;
      return new ToneRow((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          n = this[_i];
          _results.push(n + addend);
        }
        return _results;
      }).call(this));
    };

    ToneRow.prototype.nthPrime = function(n) {
      return this.add(n - this[0]);
    };

    ToneRow.prototype.inversion = function() {
      var acc, curr, i, _i, _ref;
      curr = this[0];
      acc = [curr];
      for (i = _i = 0, _ref = this.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        curr += this[i] - this[i + 1];
        acc.push(curr);
      }
      return new ToneRow(acc);
    };

    ToneRow.prototype.inversions = function() {
      var n, unsorted;
      unsorted = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          n = this[_i];
          _results.push(this.nthPrime(n).inversion());
        }
        return _results;
      }).call(this);
      return unsorted.sort(function(row1, row2) {
        return row1.compareFirstNote(row2);
      });
    };

    ToneRow.prototype.retrogradeInversions = function() {
      var n, unsorted;
      unsorted = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          n = this[_i];
          _results.push(this.nthPrime(n).inversion());
        }
        return _results;
      }).call(this);
      return unsorted.sort(function(row1, row2) {
        return row1.compareLastNote(row2);
      });
    };

    ToneRow.prototype.pack = function() {
      var n;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          n = this[_i];
          _results.push(n.toString(this.length));
        }
        return _results;
      }).call(this)).join("");
    };

    ToneRow.prototype.toInt = function() {
      return parseInt("0x" + this.pack());
    };

    vowels = "a,e,i,o,u,ee,e,e,oo,a,i,e,a,i,ou,u,e,i,e,a,i,u".split(",");

    starts = "B,Ch,Sh,D,F,C,M,N,P,R,S,T,Cr,Fr,T,Psych,Hydr,Ant,Ebr,Br,Adr,Fer,Squ".split(",");

    ends = "ch,sh,d,l,m,n,r,s,t,re,no,na,re,fi,do,su,ic,ate,n,tric".split(",");

    infixes = "b,sch,cc,dd,gh,p,p,p,n,t,l,m,n,s,b,: the ch,s,d,g,l,m,n,s,b,d,g,l,m,n,p,s,t, has a n, the gr".split(",");

    ToneRow.prototype.properName = function() {
      var rng;
      rng = new RandomNumberGenerator(this.toInt());
      return starts[rng.random(starts.length) | 0] + vowels[rng.random(vowels.length) | 0] + infixes[rng.random(infixes.length) | 0] + vowels[rng.random(vowels.length) | 0] + ends[rng.random(ends.length) | 0];
    };

    ToneRow.prototype.numericTable = function() {
      var firstInversion, n, row, s, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      s = "";
      firstInversion = this.inversion();
      console.log(firstInversion);
      s += "<tr><th></th>";
      _ref = this.nthPrime(firstInversion[0]);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        s += "<th>I" + n + "</th>";
      }
      s += "<th></th></tr>";
      for (_j = 0, _len1 = firstInversion.length; _j < _len1; _j++) {
        n = firstInversion[_j];
        row = this.nthPrime(n);
        s += "<tr>";
        s += "<th>P" + row[0] + "</th>";
        s += "<td>" + row.join("</td><td>") + "</td>";
        s += "<th>R" + (row.slice(-1)[0]) + "</th>";
        s += "</tr>";
      }
      s += "<tr><th></th>";
      _ref1 = this.nthPrime(firstInversion.slice(-1)[0]);
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        n = _ref1[_k];
        s += "<th>RI" + n + "</th>";
      }
      s += "<th></th></tr>";
      return s;
    };

    scale = "C,C#,D,D#,E,F,F#,G,G#,A,A#,B".replace(/#/g, "\u266f").split(",");

    ToneRow.prototype.chromaticTable = function(key) {
      var firstInversion, i, inversions, lastSouthwardPrime, m, n, retrogradeInversions, row, s, _i, _j, _k, _len, _len1, _len2;
      if (key == null) {
        key = 0;
      }
      key = parseInt(key);
      s = "";
      firstInversion = this.inversion(0);
      inversions = this.inversions();
      s += "<tr><th></th>";
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        n = this[_i];
        s += "<th>\n  <button data-type='I' data-row=\"" + inversions[n] + "\">I" + n + "</button>\n</th>";
      }
      s += "<th></th></tr>";
      for (_j = 0, _len1 = firstInversion.length; _j < _len1; _j++) {
        n = firstInversion[_j];
        row = this.nthPrime(n);
        s += "<tr>\n  <th><button data-type='P' data-row=\"" + (row.pack()) + "\">P" + row[0] + "</button></th>\n  <td>" + (((function() {
          var _k, _len2, _results;
          _results = [];
          for (_k = 0, _len2 = row.length; _k < _len2; _k++) {
            n = row[_k];
            _results.push(scale[(n + key) % scale.length]);
          }
          return _results;
        })()).join("</td><td>")) + "</td>\n  <th><button data-type='R' data-row=\"" + (row.reverse().pack()) + "\">R" + row[0] + "</button></th>\n</tr>";
      }
      retrogradeInversions = this.retrogradeInversions();
      lastSouthwardPrime = this.nthPrime(firstInversion.slice(-1));
      s += "<tr><th></th>";
      for (i = _k = 0, _len2 = this.length; _k < _len2; i = ++_k) {
        n = this[i];
        m = lastSouthwardPrime[i];
        s += "<th>\n  <button data-type=\"RI\" data-row=\"" + retrogradeInversions[m] + "\">RI" + m + "</button>\n</th>";
      }
      s += "<th></th></tr>";
      return s;
    };

    return ToneRow;

  })(Array);

  ToneRow.unpack = function(string) {
    var c;
    return new ToneRow((function() {
      var _i, _len, _ref, _results;
      _ref = string.split("");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        _results.push(parseInt(c, string.length));
      }
      return _results;
    })());
  };

  ToneRow.random = function(length) {
    var tr, _i, _results;
    if (length == null) {
      length = ToneRow.defaultRowLength;
    }
    tr = new ToneRow((function() {
      _results = [];
      for (var _i = 0; 0 <= length ? _i < length : _i > length; 0 <= length ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).shuffle());
    if (tr.isPerfect()) {
      return tr.nthPrime(0);
    } else {
      return ToneRow.random(length);
    }
  };

  ToneRow.weightedScaleInterval = function(intervals) {
    var sign;
    sign = (Math.random() < 0.5) * 2 - 1;
    return mod(intervals.shuffle()[0] * sign, 12);
  };

  consonantIntervals = [9, 9, 9, 7, 7, 1, 1, 2, 3, 4, 5];

  ToneRow.consonantRandom = function(length) {
    var interval, note, row, tr;
    if (length == null) {
      length = 12;
    }
    row = [0];
    while (row.length !== length) {
      interval = ToneRow.weightedScaleInterval(consonantIntervals);
      note = mod(row[row.length - 1] + interval, 12);
      if (row.indexOf(note) === -1) {
        row.push(note);
      }
    }
    tr = new ToneRow(row);
    if (tr.isPerfect()) {
      return tr;
    } else {
      return ToneRow.weightedRandom(length);
    }
  };

}).call(this);