/* Find Your Mate: picks a random real game for each .mate-deck container
   and renders an interactive flip card. Board + piece vectors reused from
   the endgame_flashcards project (same wood-free green board, Cburnett
   pieces). Front face shows either a playable board ("board" mode) or a
   plain-text piece list ("ascii" mode, no board at all) at the position
   two moves before the real game's checkmate; the user types their mate
   attempt and checks it with chess.js, then flips to see the real finish. */
(function(){
  "use strict";

  var SQ = 45, DIM = 8*SQ, MARGIN = 20, VB = DIM + MARGIN*2;
  var COLORS = {
    light: "#eeeed2", dark: "#769656",
    lightLast: "#f7f769", darkLast: "#bbcb2b",
    margin: "#1b3a1b", coord: "#eeeed2"
  };
  var FILES = "abcdefgh";

  // Cburnett piece vectors, verbatim from python-chess's chess/svg.py PIECES table
  var PIECE_DEFS =
    '<g id="pc-b" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#000" stroke-linecap="butt"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-linejoin="miter"/></g>' +
    '<g id="pc-k" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#000"/><path d="M20 8h5" stroke-linejoin="miter"/><path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/></g>' +
    '<g id="pc-n" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#000000; stroke:#000000;"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" style="fill:#000000; stroke:#000000;"/><path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" style="fill:#ececec; stroke:#ececec;"/><path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#ececec; stroke:#ececec;"/><path d="M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z " style="fill:#ececec; stroke:none;"/></g>' +
    '<g id="pc-p"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></g>' +
    '<g id="pc-q" fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/><path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#fff"/></g>' +
    '<g id="pc-r" fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" stroke-linecap="butt"/><path d="M14 29.5v-13h17v13H14z" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" stroke-linecap="butt"/><path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="miter"/></g>' +
    '<g id="pc-B" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g>' +
    '<g id="pc-K" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g>' +
    '<g id="pc-N" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#ffffff; stroke:#000000;"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" style="fill:#ffffff; stroke:#000000;"/><path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" style="fill:#000000; stroke:#000000;"/><path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#000000; stroke:#000000;"/></g>' +
    '<g id="pc-P"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></g>' +
    '<g id="pc-Q" fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g>' +
    '<g id="pc-R" fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g>';

  function mkRect(x, y, w, h, fill){
    var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", x); r.setAttribute("y", y);
    r.setAttribute("width", w); r.setAttribute("height", h);
    r.setAttribute("fill", fill);
    return r;
  }

  function addLabel(svg, cx, cy, text){
    var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", cx); t.setAttribute("y", cy);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "central");
    t.setAttribute("fill", COLORS.coord);
    t.setAttribute("font-size", "11");
    t.setAttribute("font-weight", "600");
    t.textContent = text;
    svg.appendChild(t);
  }

  function buildBoard(container){
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + VB + " " + VB);
    svg.setAttribute("class", "fc-board-svg");

    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = PIECE_DEFS;
    svg.appendChild(defs);
    svg.appendChild(mkRect(0, 0, VB, VB, COLORS.margin));

    var squareEls = {};
    for (var r = 0; r < 8; r++){
      for (var f = 0; f < 8; f++){
        var sq = FILES[f] + (8-r);
        var x = MARGIN + f*SQ, y = MARGIN + r*SQ;
        var light = ((f + (8-r)) % 2 === 0);
        var rect = mkRect(x, y, SQ, SQ, light ? COLORS.light : COLORS.dark);
        rect.dataset.sq = sq;
        rect.dataset.light = light ? "1" : "0";
        svg.appendChild(rect);
        squareEls[sq] = rect;
      }
    }
    for (var f2 = 0; f2 < 8; f2++) addLabel(svg, MARGIN + f2*SQ + SQ/2, VB - MARGIN/2, FILES[f2]);
    for (var r2 = 0; r2 < 8; r2++) addLabel(svg, MARGIN/2, MARGIN + r2*SQ + SQ/2, String(8-r2));

    var pieceLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pieceLayer.setAttribute("transform", "translate(" + MARGIN + "," + MARGIN + ")");
    svg.appendChild(pieceLayer);
    var markerG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    markerG.setAttribute("transform", "translate(" + MARGIN + "," + MARGIN + ")");
    svg.appendChild(markerG);

    container.innerHTML = "";
    container.appendChild(svg);
    return {svg: svg, squareEls: squareEls, pieceLayer: pieceLayer, markerG: markerG};
  }

  function localXY(sq){
    var file = FILES.indexOf(sq[0]);
    var rank = parseInt(sq[1], 10) - 1;
    return [file*SQ, (7-rank)*SQ];
  }

  function setSquareHighlight(h, sq, on){
    var rect = h.squareEls[sq];
    if (!rect) return;
    if (on) rect.setAttribute("fill", rect.dataset.light === "1" ? COLORS.lightLast : COLORS.darkLast);
    else rect.setAttribute("fill", rect.dataset.light === "1" ? COLORS.light : COLORS.dark);
  }
  function clearLastMove(h){ Object.keys(h.squareEls).forEach(function(sq){ setSquareHighlight(h, sq, false); }); }
  function showLastMove(h, from, to){ clearLastMove(h); if (from) setSquareHighlight(h, from, true); if (to) setSquareHighlight(h, to, true); }

  function renderPieces(h, game){
    h.pieceLayer.innerHTML = "";
    var board = game.board();
    for (var row = 0; row < 8; row++){
      for (var col = 0; col < 8; col++){
        var piece = board[row][col];
        if (!piece) continue;
        var ch = piece.color === "w" ? piece.type.toUpperCase() : piece.type;
        var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#pc-" + ch);
        use.setAttribute("href", "#pc-" + ch);
        use.setAttribute("x", col*SQ); use.setAttribute("y", row*SQ);
        use.setAttribute("width", SQ); use.setAttribute("height", SQ);
        h.pieceLayer.appendChild(use);
      }
    }
  }
  function clearMarkers(h){ h.markerG.innerHTML = ""; }
  function markSelected(h, sq){
    var xy = localXY(sq);
    var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", xy[0]+2); r.setAttribute("y", xy[1]+2);
    r.setAttribute("width", SQ-4); r.setAttribute("height", SQ-4);
    r.setAttribute("fill", "none"); r.setAttribute("stroke", "#1b3a1b");
    r.setAttribute("stroke-width", "3"); r.setAttribute("rx", "3");
    h.markerG.appendChild(r);
  }
  function markDest(h, sq, isCapture){
    var xy = localXY(sq);
    var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", xy[0]+SQ/2); c.setAttribute("cy", xy[1]+SQ/2);
    if (isCapture){
      c.setAttribute("r", SQ/2 - 3); c.setAttribute("fill", "none");
      c.setAttribute("stroke", "rgba(0,0,0,.35)"); c.setAttribute("stroke-width", "4");
    } else {
      c.setAttribute("r", SQ*0.14); c.setAttribute("fill", "rgba(0,0,0,.30)");
    }
    h.markerG.appendChild(c);
  }

  /* ---- ASCII piece-list, for the "Very Difficult" no-board mode ---- */
  var PIECE_NAMES = {k: "King", q: "Queen", r: "Rook", b: "Bishop", n: "Knight", p: "Pawn"};
  var PIECE_ORDER = ["k", "q", "r", "b", "n", "p"];

  function fmtGroup(name, squares){
    if (!squares.length) return null;
    squares = squares.slice().sort();
    if (squares.length === 1) return name + " " + squares[0];
    if (squares.length === 2) return name + "s " + squares[0] + " and " + squares[1];
    return name + "s " + squares.join(", ");
  }

  function pieceListLine(game, color, label){
    var board = game.board();
    var groups = {k: [], q: [], r: [], b: [], n: [], p: []};
    for (var row = 0; row < 8; row++){
      for (var col = 0; col < 8; col++){
        var piece = board[row][col];
        if (!piece || piece.color !== color) continue;
        var sq = FILES[col] + (8-row);
        groups[piece.type].push(sq);
      }
    }
    var parts = PIECE_ORDER.map(function(k){ return fmtGroup(PIECE_NAMES[k], groups[k]); }).filter(Boolean);
    return label + ": " + parts.join(", ");
  }

  function dataBaseUrl(){
    var cur = document.currentScript && document.currentScript.src;
    if (!cur){
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++){
        if (/mate\.js(\?|$)/.test(scripts[i].src)) { cur = scripts[i].src; break; }
      }
    }
    if (!cur) return "/data/";
    return cur.replace(/js\/mate\.js(\?.*)?$/, "data/");
  }

  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  function buildCardMarkup(deckId){
    return (
      '<div class="fc-scene"><div class="fc-card" id="' + deckId + '-card">' +
        '<div class="fc-face" id="' + deckId + '-front">' +
          '<div class="fc-tag-row"><a class="fc-tag fc-site-link" id="' + deckId + '-site" target="_blank" rel="noopener"></a><span class="fc-turn-pill" id="' + deckId + '-turnpill"></span></div>' +
          '<div class="fc-board-wrap" id="' + deckId + '-frontboard"></div>' +
          '<div class="fc-status" id="' + deckId + '-status">&nbsp;</div>' +
          '<div class="fc-answer-row">' +
            '<input type="text" class="fc-answer-input" id="' + deckId + '-answer" placeholder="Type your mate, e.g. Qh5 Kg8 Qh7#">' +
            '<button class="fc-primary" id="' + deckId + '-check">Check</button>' +
          '</div>' +
          '<p class="fc-feedback" id="' + deckId + '-feedback">&nbsp;</p>' +
          '<div class="fc-controls"><button id="' + deckId + '-reset">Reset position</button><button class="fc-primary" id="' + deckId + '-flip">Flip card →</button></div>' +
          '<div class="fc-controls"><a class="fc-btn fc-primary" id="' + deckId + '-lichess" href="#" target="_blank" rel="noopener">Open on Lichess →</a></div>' +
          '<p class="fc-caption" id="' + deckId + '-caption"></p>' +
        '</div>' +
        '<div class="fc-face fc-back">' +
          '<div class="fc-tag-row"><a class="fc-tag fc-site-link" id="' + deckId + '-site2" target="_blank" rel="noopener"></a><span class="fc-tag" id="' + deckId + '-replayturn"></span></div>' +
          '<div class="fc-board-wrap" id="' + deckId + '-backboard"></div>' +
          '<div class="fc-movelist" id="' + deckId + '-movelist"></div>' +
          '<div class="fc-result-badge" id="' + deckId + '-result" hidden></div>' +
          '<div class="fc-controls"><button id="' + deckId + '-prev">◂ Prev</button><button id="' + deckId + '-next">Next ▸</button></div>' +
          '<p class="fc-meta" id="' + deckId + '-meta"></p>' +
          '<div class="fc-controls"><button class="fc-primary" id="' + deckId + '-flipback">← Flip back</button><button id="' + deckId + '-shuffle">Shuffle a new game</button></div>' +
        '</div>' +
      '</div></div>'
    );
  }

  function checkAnswer(startFen, inputEl, feedbackEl){
    var raw = inputEl.value.trim();
    if (!raw){
      feedbackEl.textContent = "Type your moves first.";
      feedbackEl.className = "fc-feedback";
      return;
    }
    var tokens = raw.split(/\s+/)
      .map(function(t){ return t.replace(/^\d+\.+/, "").replace(/[+#!?]+$/, ""); })
      .filter(Boolean);
    var g = new Chess(startFen);
    for (var i = 0; i < tokens.length; i++){
      var mv = g.move(tokens[i], {sloppy: true});
      if (!mv){
        feedbackEl.textContent = "Not a legal move: “" + tokens[i] + "” (move " + (i+1) + " of your answer).";
        feedbackEl.className = "fc-feedback fc-feedback-bad";
        return;
      }
    }
    if (g.in_checkmate()){
      feedbackEl.textContent = "✓ Checkmate — you found it!";
      feedbackEl.className = "fc-feedback fc-feedback-good";
    } else {
      feedbackEl.textContent = "Legal so far, but that’s not checkmate yet. Keep going, or flip the card to see the real finish.";
      feedbackEl.className = "fc-feedback fc-feedback-bad";
    }
  }

  function setupDeck(container, entry){
    var deckId = container.id;
    var mode = container.dataset.mode === "ascii" ? "ascii" : "board";
    container.innerHTML = buildCardMarkup(deckId);

    var startFen = entry.startFen;
    var replaySans = entry.moves || [];
    var startParts = startFen.split(" ");
    var startColor = startParts[1] === "b" ? "Black" : "White";
    var startMoveNo = parseInt(startParts[5], 10) || 1;

    var siteLink = document.getElementById(deckId + "-site");
    var siteLink2 = document.getElementById(deckId + "-site2");
    siteLink.textContent = (entry.site || "").replace(/^https?:\/\//, "") + (entry.site ? " · move " + startMoveNo : "");
    siteLink2.textContent = (entry.site || "").replace(/^https?:\/\//, "");
    if (entry.site){
      siteLink.href = entry.site;
      siteLink2.href = entry.site;
    } else {
      siteLink.removeAttribute("href");
      siteLink2.removeAttribute("href");
    }
    document.getElementById(deckId + "-meta").textContent =
      (entry.event || "Rated game") + " · " + (entry.white || "White") + " (" + (entry.whiteElo || "?") + ") vs " + (entry.black || "Black") + " (" + (entry.blackElo || "?") + ")";

    var statusEl = document.getElementById(deckId + "-status");
    var pillEl = document.getElementById(deckId + "-turnpill");
    var captionEl = document.getElementById(deckId + "-caption");
    var answerInput = document.getElementById(deckId + "-answer");
    var feedbackEl = document.getElementById(deckId + "-feedback");
    var resetBtn = document.getElementById(deckId + "-reset");

    pillEl.textContent = startColor + " to move";

    /* ---- front ---- */
    if (mode === "ascii"){
      var g0 = new Chess(startFen);
      document.getElementById(deckId + "-frontboard").innerHTML =
        '<div class="fc-ascii"><p>' + pieceListLine(g0, "w", "White (W)") + '.</p>' +
         '<p>' + pieceListLine(g0, "b", "Black (B)") + '.</p></div>';
      statusEl.textContent = startColor + " to move. Find the mate.";
      captionEl.textContent = "No board here — picture the position from the piece list, then type your mate below.";
      resetBtn.style.display = "none";
    } else {
      (function(){
        var game = new Chess(startFen);
        var h = buildBoard(document.getElementById(deckId + "-frontboard"));
        var selected = null;

        function updateStatus(){
          pillEl.textContent = (game.turn()==="w" ? "White" : "Black") + " to move";
          var msg = "";
          if (game.in_checkmate()) msg = "Checkmate.";
          else if (game.in_stalemate()) msg = "Stalemate.";
          else if (game.insufficient_material()) msg = "Draw — insufficient material.";
          else if (game.in_check()) msg = "Check.";
          statusEl.textContent = msg || "Find the mate.";
        }

        function showPromoPicker(color){
          return new Promise(function(resolve){
            var overlay = document.createElement("div");
            overlay.className = "fc-promo-overlay";
            var box = document.createElement("div");
            box.className = "fc-promo-box";
            overlay.appendChild(box);
            ["q","r","b","n"].forEach(function(p){
              var btn = document.createElement("button");
              var ch = color === "w" ? p.toUpperCase() : p;
              var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              s.setAttribute("viewBox", "0 0 45 45");
              var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
              use.setAttribute("href", "#pc-" + ch);
              use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#pc-" + ch);
              s.appendChild(use);
              btn.appendChild(s);
              btn.addEventListener("click", function(){ overlay.remove(); resolve(p); });
              box.appendChild(btn);
            });
            var wrap = document.getElementById(deckId + "-frontboard");
            wrap.style.position = "relative";
            wrap.appendChild(overlay);
          });
        }

        h.svg.addEventListener("click", function(ev){
          if (game.game_over()) return;
          var target = ev.target.closest ? ev.target.closest("[data-sq]") : null;
          if (!target) return;
          var sq = target.dataset.sq;
          var piece = game.get(sq);

          if (selected){
            var moves = game.moves({square: selected, verbose: true});
            var match = moves.filter(function(m){ return m.to === sq; });
            if (match.length){
              var mv = match[0];
              var finish = function(promo){
                game.move({from: selected, to: sq, promotion: promo});
                showLastMove(h, selected, sq);
                selected = null;
                clearMarkers(h);
                renderPieces(h, game);
                updateStatus();
              };
              if (mv.flags.indexOf("p") !== -1) showPromoPicker(mv.color).then(finish);
              else finish();
              return;
            }
          }
          clearMarkers(h);
          if (piece && piece.color === game.turn()){
            selected = sq;
            markSelected(h, sq);
            game.moves({square: sq, verbose: true}).forEach(function(m){
              markDest(h, m.to, !!game.get(m.to) || m.flags.indexOf("e") !== -1);
            });
          } else {
            selected = null;
          }
        });

        resetBtn.addEventListener("click", function(){
          game.load(startFen);
          selected = null;
          clearMarkers(h);
          clearLastMove(h);
          renderPieces(h, game);
          updateStatus();
        });

        renderPieces(h, game);
        updateStatus();
      })();
      captionEl.textContent = "Click a piece, then a highlighted square, to try it here — or type your answer below.";
    }

    document.getElementById(deckId + "-lichess").href =
      "https://lichess.org/analysis/" + startFen.replace(/ /g, "_") + "?color=" + (startColor.toLowerCase());

    document.getElementById(deckId + "-check").addEventListener("click", function(){
      checkAnswer(startFen, answerInput, feedbackEl);
    });
    answerInput.addEventListener("keydown", function(ev){
      if (ev.key === "Enter") checkAnswer(startFen, answerInput, feedbackEl);
    });

    /* ---- back: scripted replay of the real finish ---- */
    (function(){
      var h = buildBoard(document.getElementById(deckId + "-backboard"));
      var moveListEl = document.getElementById(deckId + "-movelist");
      var resultBadge = document.getElementById(deckId + "-result");
      var replayTurnEl = document.getElementById(deckId + "-replayturn");
      var idx = 0;

      var states = [new Chess(startFen)];
      var plyMoves = [null];
      replaySans.forEach(function(san){
        var g = new Chess(states[states.length-1].fen());
        var mv = g.move(san);
        states.push(g);
        plyMoves.push(mv);
      });

      function wrap(i, san){
        return '<span class="' + (i === idx-1 ? "fc-cur" : "") + '">' + san + "</span>";
      }
      function renderList(){
        var html = "", moveNo = startMoveNo, i = 0;
        if (replaySans.length && startColor === "Black"){
          html += moveNo + "… " + wrap(0, replaySans[0]) + " ";
          i = 1;
          moveNo++;
        }
        while (i < replaySans.length){
          html += moveNo + ". " + wrap(i, replaySans[i]);
          i++;
          if (i < replaySans.length){
            html += " " + wrap(i, replaySans[i]) + " ";
            i++;
          }
          moveNo++;
        }
        moveListEl.innerHTML = html;
      }
      function update(){
        renderPieces(h, states[idx]);
        clearMarkers(h);
        var mv = plyMoves[idx];
        showLastMove(h, mv ? mv.from : null, mv ? mv.to : null);
        renderList();
        replayTurnEl.textContent = idx === 0 ? "move " + startMoveNo + " (start)" :
          (idx === replaySans.length ? "final position" : "after " + replaySans[idx-1]);
        resultBadge.hidden = idx !== replaySans.length;
        resultBadge.textContent = entry.result || "";
        document.getElementById(deckId + "-prev").disabled = idx === 0;
        document.getElementById(deckId + "-next").disabled = idx === replaySans.length;
      }
      document.getElementById(deckId + "-prev").addEventListener("click", function(){ if (idx > 0){ idx--; update(); } });
      document.getElementById(deckId + "-next").addEventListener("click", function(){ if (idx < replaySans.length){ idx++; update(); } });
      update();
    })();

    var cardEl = document.getElementById(deckId + "-card");
    document.getElementById(deckId + "-flip").addEventListener("click", function(){ cardEl.classList.add("flipped"); });
    document.getElementById(deckId + "-flipback").addEventListener("click", function(){ cardEl.classList.remove("flipped"); });
    document.getElementById(deckId + "-shuffle").addEventListener("click", function(){
      var deck = container.__fcDeck;
      if (deck && deck.length > 1){
        var next = pick(deck);
        setupDeck(container, next);
      }
    });
  }

  function initDeckContainer(container){
    var cat = container.dataset.category;
    fetch(dataBaseUrl() + cat + ".json")
      .then(function(r){ if (!r.ok) throw new Error("no data"); return r.json(); })
      .then(function(deck){
        if (!deck || !deck.length){
          container.innerHTML = '<p class="fc-empty">No puzzles loaded for this level yet.</p>';
          return;
        }
        container.__fcDeck = deck;
        setupDeck(container, pick(deck));
      })
      .catch(function(){
        container.innerHTML = '<p class="fc-empty">Couldn’t load puzzles for this level.</p>';
      });
  }

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".mate-deck[data-category]").forEach(initDeckContainer);
  });
})();
