"use strict"

# proper mod that deals with negatives
mod = (n, period) -> ((n % period) + period) % period

Array::shuffle = ->
  n = @length
  while n--
    i = Math.floor(Math.random() * n)
    tmp = @[i]
    @[i] = @[n]
    @[n] = tmp
  @
  
class RandomNumberGenerator
  constructor: (@seed = 6) ->
  
  # Randomness magic numbers
  a = 9301
  b = 49297
  c = 233280.0
  
  random: (max = 1, min = 0) ->
    @seed = (@seed * a + b) % c
    min + (@seed / c) * (max - min)


@["ToneRow"] = class ToneRow extends Array
  constructor: (list = []) ->
    @replace list
    # Modular arithmetic. Make sure values don't over/underflow @length.
    @replace (mod n, 12 for n in @)

  replace: (other) ->
    @length = 0
    @push other...
  
  equals: (other) -> not (@ < other or other < @)
  compareFirstNote: (other) -> @[0] > other[0]
  compareLastNote: (other) -> @slice(-1)[0] > other.slice(-1)[0]
  
  isUnique: -> (i for i,n in @ when @indexOf(i) == n).length == @length
  isPerfect: -> @isUnique() and @inversion().isUnique()
  
  add: (addend) -> new ToneRow (n + addend for n in @)
  nthPrime: (n) -> @add n - @[0]
  
  inversion: ->
    curr = @[0]
    acc = [curr]
    
    for i in [0..@length-2]
      curr += (@[i] - @[i+1])
      acc.push(curr)

    new ToneRow(acc)
  
  inversions: ->
    unsorted = (@nthPrime(n).inversion() for n in @)
    unsorted.sort (row1, row2) -> row1.compareFirstNote row2

  retrogradeInversions: ->
    unsorted = (@nthPrime(n).inversion() for n in @)
    unsorted.sort (row1, row2) -> row1.compareLastNote row2

  pack: -> (n.toString(@length) for n in @).join("")
  toInt: -> parseInt "0x" + @pack()
  
  vowels = "a,e,i,o,u,ee,e,e,oo,a,i,e,a,i,ou,u,e,i,e,a,i,u".split ","
  starts = "B,Ch,Sh,D,F,C,M,N,P,R,S,T,Cr,Fr,T,Psych,Hydr,Ant,Ebr,Br,Adr,Fer,Squ".split ","
  ends = "ch,sh,d,l,m,n,r,s,t,re,no,na,re,fi,do,su,ic,ate,n,tric".split ","
  infixes = "b,sch,cc,dd,gh,p,p,p,n,t,l,m,n,s,b,: the ch,s,d,g,l,m,n,s,b,d,g,l,m,n,p,s,t, has a n, the gr".split ","
  
  properName: ->
    rng = new RandomNumberGenerator @toInt()
   
    starts[rng.random(starts.length)|0] +
    vowels[rng.random(vowels.length)|0] +
    infixes[rng.random(infixes.length)|0] +
    vowels[rng.random(vowels.length)|0] +
    ends[rng.random(ends.length)|0]

  # should separate views from model?
  numericTable: ->
    s = ""
    
    firstInversion = @inversion()
    console.log firstInversion 
    
    s += "<tr><th></th>"
    for n in @nthPrime(firstInversion[0])
      s += "<th>I#{n}</th>"
    s += "<th></th></tr>"
      
    for n in firstInversion
      row = @nthPrime(n)
      s += "<tr>"
      s +=   "<th>P#{row[0]}</th>"
      s +=   "<td>" + row.join("</td><td>") + "</td>"
      s +=   "<th>R#{row.slice(-1)[0]}</th>"
      s += "</tr>"

    s += "<tr><th></th>"
    for n in @nthPrime(firstInversion.slice(-1)[0])
      s += "<th>RI#{n}</th>"
    s += "<th></th></tr>"

    s
  
  scale = "C,C#,D,D#,E,F,F#,G,G#,A,A#,B".replace(/#/g, "\u266f").split(",")
  
  chromaticTable: (key = 0) ->
    key = parseInt key
  
    s = ""
    
    firstInversion = @inversion(0)
    
    inversions = @inversions()
    
    s += "<tr><th></th>"
    for n in @
      s += """
        <th>
          <button data-type='I' data-row="#{inversions[n]}">I#{n}</button>
        </th>
        """
    s += "<th></th></tr>"
      
    for n in firstInversion
      row = @nthPrime(n)
      s += """
        <tr>
          <th><button data-type='P' data-row="#{row.pack()}">P#{row[0]}</button></th>
          <td>#{(scale[(n + key) % scale.length] for n in row).join("</td><td>")}</td>
          <th><button data-type='R' data-row="#{row.reverse().pack()}">R#{row[0]}</button></th>
        </tr>
      """


    retrogradeInversions = @retrogradeInversions()
    
    lastSouthwardPrime = @nthPrime(firstInversion.slice(-1))
    
    s += "<tr><th></th>"
    for n,i in @
      m = lastSouthwardPrime[i]
      s += """
        <th>
          <button data-type="RI" data-row="#{retrogradeInversions[m]}">RI#{m}</button>
        </th>
      """
    s += "<th></th></tr>"

    s

ToneRow.unpack = (string) ->
  new ToneRow (parseInt(c, string.length) for c in string.split(""))

ToneRow.random = (length = ToneRow.defaultRowLength) ->
  tr = new ToneRow([0...length].shuffle())
  if tr.isPerfect() then tr.nthPrime(0) else ToneRow.random(length)

ToneRow.weightedScaleInterval = (intervals) ->
  sign = ((Math.random()<0.5)*2-1) # -1 or 1
  mod (intervals.shuffle()[0] * sign), 12

consonantIntervals = [9,9,9, 7,7, 1,1, 2,3,4,5]

ToneRow.consonantRandom = (length = 12) ->
  row = [0]
  until row.length is length
    interval = ToneRow.weightedScaleInterval(consonantIntervals)
    note = mod (row[row.length - 1] + interval), 12
    row.push note if row.indexOf(note) == -1
  
  tr = new ToneRow row
  if tr.isPerfect() then tr else ToneRow.weightedRandom(length)
