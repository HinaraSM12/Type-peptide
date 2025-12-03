// Lista de aminoácidos permitidos (código de una letra)
var aminoacids_list = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
                       'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y'];

var aminosFullName = {
  'A': 'Alaline',
  'R': 'Arginine',
  'N': 'Asparagine',
  'D': 'Aspartic',
  'C': 'Cysteine',
  'Q': 'Glutamine',
  'E': 'Glutamic Acid',
  'G': 'Glycine',
  'H': 'Histidine',
  'I': 'Isoleucine',
  'L': 'Leucine',
  'K': 'Lysine',
  'M': 'Methionine',
  'F': 'Phenylalanine',
  'P': 'Proline',
  'S': 'Serine',
  'T': 'Threonine',
  'W': 'Tryptophan',
  'Y': 'Tyrosine',
  'V': 'Valine'
};

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function get_x(i, pos_off = 0, neg_off = 0) {
  var radius = 10;
  radius = radius + radius * (pos_off - neg_off);
  var value = Math.cos(toRadians(100 * i)) * radius;
  return value;
}

function get_y(i, pos_off = 0, neg_off = 0) {
  var radius = 10;
  radius = radius + radius * (pos_off - neg_off);
  var value = Math.sin(toRadians(100 * i)) * radius;
  return value;
}

function validateEntry(event) {
  var chart = event.key.toUpperCase();
  var key = event.keyCode || event.charCode;
  if (key === 8 || key === 46) return true;
  return aminoacids_list.indexOf(chart) !== -1;
}

/* --------- PROPIEDADES FISICOQUÍMICAS --------- */

function getCharge(seq, pH = 7.0) {
  if (!seq) return 0;

  var up = seq.toUpperCase();
  var pow10 = function (x) { return Math.pow(10, x); };

  var pKa = {
    R: 12.48, K: 10.79, H: 6.04,
    D: 3.86, E: 4.25, C: 8.33, Y: 10.07,
    Nterm: 9.69, Cterm: 2.34
  };

  var CNi = 0; // positivas
  var CNj = 0; // negativas

  for (var i = 0, len = up.length; i < len; i++) {
    var aa = up[i];
    if (aa === "R" || aa === "K" || aa === "H") {
      CNi += pow10(pKa[aa]) / (pow10(pH) + pow10(pKa[aa]));
    } else if (aa === "D" || aa === "E" || aa === "C" || aa === "Y") {
      CNj += pow10(pH) / (pow10(pH) + pow10(pKa[aa]));
    }
  }

  // extremos
  CNi += pow10(pKa.Nterm) / (pow10(pH) + pow10(pKa.Nterm));
  CNj += pow10(pH) / (pow10(pH) + pow10(pKa.Cterm));

  return CNi - CNj;
}

function getIsoEle(aminoacids) {
  var CNi = 0;
  var CNj = 0;
  var CN = 0;
  var PI = 0;

  if (aminoacids !== "") {
    for (var i = 0; i < 14; i = i + 0.01) {
      for (var j = 0, len = aminoacids.length; j < len; j++) {
        switch (aminoacids[j]) {
          case "R":
            CNi = CNi + ((10 ** 12.48) / ((10 ** i) + (10 ** 12.48)));
            break;
          case "K":
            CNi = CNi + ((10 ** 10.79) / ((10 ** i) + (10 ** 10.79)));
            break;
          case "H":
            CNi = CNi + ((10 ** 6.04) / ((10 ** i) + (10 ** 6.04)));
            break;
          case "D":
            CNj = CNj + ((10 ** i) / ((10 ** i) + (10 ** 3.86)));
            break;
          case "E":
            CNj = CNj + ((10 ** i) / ((10 ** i) + (10 ** 4.25)));
            break;
          case "C":
            CNj = CNj + ((10 ** i) / ((10 ** i) + (10 ** 8.33)));
            break;
          case "Y":
            CNj = CNj + ((10 ** i) / ((10 ** i) + (10 ** 10.07)));
            break;
        }
      }

      CNi = CNi + ((10 ** 9.69) / ((10 ** i) + (10 ** 9.69)));
      CNj = CNj + ((10 ** i) / ((10 ** i) + (10 ** 2.34)));
      CN = CNi - CNj;

      if (CN >= -0.1 && CN <= 0.1) {
        PI = i.toFixed(1);
      }

      CNi = 0;
      CNj = 0;
    }
  }

  return PI;
}

function getHidrof(aminoacids) {
  if (!aminoacids || aminoacids.length === 0) return 0;
  var H = 0;

  for (var j = 0, len = aminoacids.length; j < len; j++) {
    switch (aminoacids[j]) {
      case "A":
      case "I":
      case "L":
      case "F":
      case "V":
      case "M":
      case "C":
      case "W":
        ++H;
        break;
    }
  }

  return ((H / aminoacids.length) * 100).toFixed(2);
}

function getMoment(aminoacids) {
  if (!aminoacids || aminoacids.length === 0) return 0;

  var $sen = 0;
  var $cos = 0;
  var $MH = 0;
  var $MHr = 0;
  var $i = 0;

  for (var j = 0, len = aminoacids.length; j < len; j++) {
    $i++;
    switch (aminoacids[j]) {
      case "A":
        $sen = $sen + 1.8 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos + 1.8 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "I":
        $sen = $sen + 4.5 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos + 4.5 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "L":
        $sen = $sen + 3.8 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos + 3.8 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "W":
        $sen = $sen - 0.9 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 0.9 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "F":
        $sen = $sen + 2.8 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos + 2.8 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "V":
        $sen = $sen + 4.2 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos + 4.2 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "M":
        $sen = $sen + 1.9 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos + 1.9 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "Y":
        $sen = $sen - 1.3 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 1.3 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "P":
        $sen = $sen - 1.6 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 1.6 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "T":
        $sen = $sen - 0.7 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 0.7 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "S":
        $sen = $sen - 0.8 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 0.8 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "C":
        $sen = $sen + 2.5 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos + 2.5 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "G":
        $sen = $sen - 0.4 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 0.4 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "N":
      case "D":
      case "Q":
      case "E":
        $sen = $sen - 3.5 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 3.5 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "H":
        $sen = $sen - 3.2 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 3.2 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "K":
        $sen = $sen - 3.9 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 3.9 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
      case "R":
        $sen = $sen - 4.5 * Math.sin((($i + 1) * 100 * Math.PI) / 180);
        $cos = $cos - 4.5 * Math.cos((($i + 1) * 100 * Math.PI) / 180);
        break;
    }
  }

  $MH = (1 / aminoacids.length) * (((($sen ** 2) + ($cos ** 2)) ** 0.5));
  $MHr = (($MH / 2.88) * 100).toFixed(2);
  return $MHr;
}

function getBoman(aminoacids) {
  if (!aminoacids || aminoacids.length === 0) return 0;

  var $IB = 0;
  for (var j = 0, len = aminoacids.length; j < len; j++) {
    switch (aminoacids[j]) {
      case "A":
        $IB = $IB + 1.81;
        break;
      case "I":
      case "L":
        $IB = $IB + 4.92;
        break;
      case "W":
        $IB = $IB + 2.33;
        break;
      case "F":
        $IB = $IB + 2.98;
        break;
      case "V":
        $IB = $IB + 4.04;
        break;
      case "M":
        $IB = $IB + 2.35;
        break;
      case "Y":
        $IB = $IB - 0.14;
        break;
      case "T":
        $IB = $IB - 2.57;
        break;
      case "S":
        $IB = $IB - 3.40;
        break;
      case "C":
        $IB = $IB + 1.28;
        break;
      case "G":
        $IB = $IB + 0.94;
        break;
      case "N":
        $IB = $IB - 6.64;
        break;
      case "D":
        $IB = $IB - 8.75;
        break;
      case "Q":
        $IB = $IB - 5.54;
        break;
      case "E":
        $IB = $IB - 6.81;
        break;
      case "H":
        $IB = $IB - 4.66;
        break;
      case "K":
        $IB = $IB - 5.55;
        break;
      case "R":
        $IB = $IB - 14.92;
        break;
    }
  }
  $IB = (-$IB / aminoacids.length);
  return $IB.toFixed(2);
}

/* --------- Escalas Wimley --------- */

var octanol_interface_wimley = {
  "A": 0.33,
  "R": 1,
  "N": 0.43,
  "D": 2.41,
  "C": 0.22,
  "Q": 0.19,
  "E": 1.61,
  "G": 1.14,
  "H": -0.06,
  "I": -0.81,
  "L": -0.69,
  "K": 1.81,
  "M": -0.44,
  "F": -0.58,
  "P": -0.31,
  "S": 0.33,
  "T": 0.11,
  "W": -0.24,
  "Y": 0.23,
  "V": -0.53
};

var octanol_wimley = {
  "A": 0.5,
  "R": 1.81,
  "N": 0.85,
  "D": 3.64,
  "C": -0.02,
  "Q": 0.77,
  "E": 3.63,
  "G": 1.15,
  "H": 0.11,
  "I": -1.12,
  "L": -1.25,
  "K": 2.80,
  "M": -0.67,
  "F": -1.71,
  "P": 0.14,
  "S": 0.46,
  "T": 0.25,
  "W": -2.08,
  "Y": -0.71,
  "V": -0.46
};

var interface_wimley = {
  "A": 0.17,
  "S": 0.13
};

function getWimley(string, scale) {
  if (!string || string.length === 0) return 0;
  scale = scale || octanol_interface_wimley;

  var WL = 0;
  for (var index = 0; index < string.length; index++) {
    var amino = string[index];
    if (scale.hasOwnProperty(amino)) {
      WL += scale[amino];
    }
  }

  WL = WL.toFixed(2);
  return WL;
}
