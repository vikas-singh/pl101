function convertPitch(pitch) {
    // Get letter and octave out of pitch
    var letter = pitch.substring(0,1);
    var octave = pitch.substring(1);

    var midi;

    switch(letter) {
    case 'A':
    case 'a':
        midi = 9;
        break;
    case 'B':
    case 'b':
        midi = 11;
        break;
    case 'C':
    case 'c':
        midi = 0;
        break;
    case 'D':
    case 'd':
        midi = 2;
        break;
    case 'E':
    case 'e':
        midi = 4;
        break;
    case 'F':
    case 'f':
        midi = 5;
        break;
    case 'G':
    case 'g':
        midi = 7;
        break;
    }

    return 12 + 12 * octave + midi;
}

var endTime = function (time, expr) {

    switch (expr.tag) {
    case 'note':
    case 'rest':
        return time + expr.dur;
    case 'par':
        var leftEnd = endTime(time, expr.left);
        var rightEnd = endTime(time, expr.right);
        return leftEnd > rightEnd ? leftEnd : rightEnd;
    default:
        var leftEndTime = endTime(time, expr.left);
        return endTime(leftEndTime, expr.right);
    }
};

var recCompile = function (expr, startTime, result) {
    switch (expr.tag) {
    case 'note':
        var noteTag = {tag: expr.tag,
                       pitch: convertPitch(expr.pitch),
                       start: startTime,
                       dur: expr.dur};
        result.push(noteTag);
        break;
    case 'rest':
        var restTag = {tag: expr.tag,
                       start: startTime,
                       dur: expr.dur};
        result.push(restTag);
        break;
    case 'par':
        recCompile(expr.left, startTime, result);
        recCompile(expr.right, startTime, result);
        break;
    case 'seq':
        recCompile(expr.left, startTime, result);
        recCompile(expr.right,
                   endTime(startTime, expr.left),
                   result);
        break;
    case 'repeat':
        var beginTime = startTime;
        for (var idx = 0; idx < expr.count; idx++) {
            recCompile(expr.section, beginTime, result);
            beginTime = endTime(beginTime, expr.section);
        }
        break;
    }
};

var compile = function (musexpr) {
    var result = [];
    recCompile(musexpr, 0, result);
    return result;
};

var melody_mus =
    { tag: 'seq',
      left:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'd1', dur: 250 },
         right: { tag: 'note', pitch: 'e1', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'f1', dur: 500 },
         right: { tag: 'repeat',
                  section: { tag: 'note', pitch: 'g1', dur: 500 },
                  count: 3} } };

console.log(melody_mus);
console.log(compile(melody_mus));