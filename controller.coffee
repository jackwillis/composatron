"use strict"

f = document.forms
$ = (id) -> document.getElementById(id)

ttr = null
key = null
rhythm = null
velocity = null

midiChannel = 0

colorMap = MusicTheory.Synesthesia.map()

toArray = (arr) -> Array::slice.call arr

showError = (errText) ->
  $("errorLog").innerHTML = "Error: #{errText}"
  clearTimeout showError.clock
  showError.clock = setTimeout (-> $("errorLog").innerHTML = ""), 2500
  false
  
showUpdate = (updateText) ->
  $("updateLog").innerHTML = updateText
  clearTimeout showUpdate.clock
  showUpdate.clock = setTimeout (-> $("updateLog").innerHTML = ""), 2500
  false

clearLog = ->
  $("errorLog").innerHTML = ""
  $("updateLog").innerHTML = ""
  false

stopEverything = ->
  clearTimeout(i) for i in [0..setTimeout(";")] # hackish (a dummy timeout has highest pid)
  MIDI.noteOff(midiChannel, note, 0) for note in [0..200] if MIDI.noteOff # hackish

randomizeTables = ->
  stopEverything()
  ttr = ToneRow.consonantRandom()
  updateTables arguments...

getNoteCells = (button) ->
  type = button.getAttribute "data-type"

  switch type
  
    when "P", "R"
      row = toArray button.parentElement.parentElement.childNodes

      switch type
        when "P"
          row.slice 3, -3
        when "R"
          row.reverse().slice 3, -3

    when "I", "RI"
      sibling = button.parentElement
      buttonIndex = 0
      buttonIndex++ while (sibling = sibling.previousSibling) != null
      
      allRows = button.parentElement.parentElement.parentElement.childNodes
      length = ToneRow.unpack(button.getAttribute("data-row")).length
      
      # I and RI types use columns instead of rows
      switch type
        when "I"
          (allRows[i+1].childNodes[buttonIndex+2] for i in [0..length])
        when "RI"
          (allRows[i].childNodes[buttonIndex+2] for i in [0..length]).reverse()

    else []

flashColor = (color, cell, delay) ->
  setTimeout (->
    cell.style.background = color
    cell.className = "highlighted"
  ), delay*1000
  
  setTimeout (->
    cell.style.transitionProperty = "background"
    cell.style.transitionDuration = "1s"
    cell.style.transitionTimingFunction = "linear"
    cell.style.transitionDelay = 1000
    cell.style.background = "#fff"
    cell.className = ""
  ), delay*1000 + 250
  
bindButton = (button) -> button.onclick = ->
  row = ToneRow.unpack @getAttribute("data-row")
  
  #MIDI.programChange(0, 0)

  noteCells = getNoteCells(button)
  
  delay = 0
  for note,i in row
    pitch = MIDI.pianoKeyOffset + (key+3) + note + 36
    randomOctaveAdjustment = (Math.random()<0.5)*-12
    
    flashColor colorMap[pitch].hex, noteCells[i], delay
    
    MIDI.noteOn midiChannel,
                pitch+randomOctaveAdjustment,
                velocity[i%velocity.length],
                delay
    
    delay += rhythm[i % rhythm.length] * 2

updateTables = (updateHash = true) ->

  stopEverything()
  updateValues()
  
  if updateHash then window.location.hash = ttr.pack()
  $("rowInfo").innerHTML  = "Composition <tt> ##{ttr.pack()}</tt>"
  $("nameSuggestion").innerHTML = "“#{ttr.properName()}!”"
  $("numericTable").innerHTML = ttr.numericTable()
  $("chromaticTable").innerHTML = ttr.chromaticTable(key)
  
  updateButtons()
  false

updateValues = ->
  key = parseInt f.options.keySelection.value
  
  rsel = f.options.rhythmSelection.selectedOptions[0]
  
  rhythm = (parseFloat n for n in rsel.getAttribute("data-rhythm").split ",")
  velocity = (parseFloat n for n in rsel.getAttribute("data-velocity").split ",")

updateButtons = ->
  bindButton(button) for button in $("chromaticTable").getElementsByTagName "button"

loadCompString = (compString, verbose = false) ->
  compString = compString.replace /[#\s]/g, ""

  if compString.match /([^a-z0-9]|^$)/
    return showError "Composition must be alphanumeric and nonblank."
  
  newTTR = ToneRow.unpack compString
  
  unless newTTR.length is 12
    return showError "Composition must have length of 12."
  
  unless newTTR.isUnique()
    return showError "Composition '#{compString}' is not unique."

  unless newTTR.isPerfect()
    return showError "Composition '#{compString}' is imperfect."
  
  ttr = newTTR

  if verbose
    showUpdate "Composition '#{compString}' loaded!"
  else
    clearLog()
  
  updateTables()

disableButtons = ->
  button.disabled = "disabled" for button in document.getElementsByTagName "button"

enableButtons = ->
  button.disabled = "" for button in document.getElementsByTagName "button"

window.onload = ->

  if window.location.hash == ''
    randomizeTables(false)
  else 
    loadCompString(window.location.hash)
  
  f.refresh.onsubmit = -> randomizeTables()
  f.options.keySelection.onchange = updateTables
  f.options.rhythmSelection.onchange = updateValues
  f.load.onsubmit = -> loadCompString(@loadComposition.value, true)
  window.onhashchange = -> loadCompString(window.location.hash)
    
  $("helpOpenLink").onclick = -> $("helpMessage").style.visibility = "visible" ; false
  $("helpCloseLink").onclick = -> $("helpMessage").style.visibility = "hidden"; false

  #showUpdate "Loading MIDI soundfont…"
  disableButtons()
  MIDI.loadPlugin
    soundfontUrl: "./MIDI.js/soundfont/",
    instruments: [ "acoustic_grand_piano" ],
    callback: ->
      showUpdate "MIDI soundfont loaded!"
      enableButtons()
