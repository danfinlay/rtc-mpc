var yo = require('yo-yo')
var nets = require('nets')
var baudio = require('webaudio')
var rtcDataStream = require('rtc-data-stream')
var quickconnect = require('rtc-quickconnect')

// Internal variables
var context = new (window.AudioContext || window.webkitAudioContext)()
var soundUrl = 'http://www.wavlist.com/soundfx/002/cat-meow4.wav'
var buffers = {}
var loading

// Initialization
var el = generateTemplate()
document.body.appendChild(el)
loadSound(soundUrl)

function generateTemplate() {
  return yo`
    <section>
      ${ loading ? yo`<h1>LOADING...</h1` : '' }
      <h1>RTC MPC</h1>
      <h2>Press space bar to play your sound.</h2>
      <h3>Drop a url to an audio file onto this page to change your sound.</h3>

      <label>Enter a room name to change rooms</label>
      <input id="roomName" placeholder="Room Name" type="text">
      <button onclick=${submit}>Submit</button>
  </section>
  `
}

function update() {
  yo.update(el, generateTemplate())
}

function loading() { loading = true; update() }
function doneLoading() { loading = false; update() }

function submit() {
  var input = document.querySelector('#roomName')
  if (input) {
    var roomName = input.value
    updateRoom(roomName)
  }
}

window.addEventListener('drop', doDrop)
function doDrop(event) {
  event.preventDefault()
  var reqUrl = event.dataTransfer.getData('URL')
  loadSound(reqUrl)
}

function loadSound(reqUrl) {
  loading()
  var url = 'http://crossorigin.me/'+reqUrl
  downloadAudio(url, function(){ doneLoading() })
}

function downloadAudio(url, cb){
  nets(url, function(err, resp, buff) {
    if (err) return cb()

    buff = ensureBufferType(buff)
    context.decodeAudioData(buff.buffer)
    .then(function(buffer) {
      buffers[url] = buffer
      cb()
    })
    .catch(function(reason) {
      console.error('problem decoding ' + url)
      cb()
    })
  })
}

function ensureBufferType(buff){
  if (!(buff instanceof Uint8Array)){
    buff = toArrayBuffer(buff)
  }
  return buff
}

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return view
}

