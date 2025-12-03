// ================================
//  colorHandler.js  (Type-Peptide)
// ================================

// Color "transparente" para los sprites de texto
const transparentColor = { r: 0, g: 0, b: 0, a: 0 };

/**
 * Convierte un color en hex (#RRGGBB o RRGGBB) a objeto {r,g,b,a}
 * @param {string} hexColor - "#FF0000" o "FF0000"
 * @param {number} alpha - opacidad (0-1)
 */
function getRGBColor(hexColor, alpha = 1) {
  const h = cutHex(hexColor);
  return {
    r: hexToR(h),
    g: hexToG(h),
    b: hexToB(h),
    a: alpha
  };
}

function hexToR(h) { return parseInt(h.substring(0, 2), 16); }
function hexToG(h) { return parseInt(h.substring(2, 4), 16); }
function hexToB(h) { return parseInt(h.substring(4, 6), 16); }

function cutHex(h) {
  return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
}

// -----------------------------
// Colores por tipo de aminoácido
// -----------------------------

const greenLime = "#19FC01";
const blueSky   = "#AED9E4";
const purple    = "#A417F4";
const red       = "#FE0001";
const blueKing  = "#04007F";
const yellow    = "#FFFD01";

/**
 * Mapa de color por aminoácido (código de una letra)
 */
const aminosColor = {
  "P": greenLime,
  "H": blueSky,

  "T": purple, "S": purple, "Q": purple, "N": purple,

  "D": red, "E": red,

  "R": blueKing, "K": blueKing,

  "A": yellow, "C": yellow, "F": yellow, "G": yellow,
  "I": yellow, "L": yellow, "M": yellow, "V": yellow,
  "W": yellow, "Y": yellow
};

// -----------------------------
// Radio de la esfera por aminoácido
// -----------------------------

/**
 * Devuelve el radio de la esfera para un aminoácido.
 * Puedes ajustar los valores si quieres otras proporciones.
 */
function getRadioAmino(letter) {
  switch (letter) {
    // Hidrofóbicos grandes
    case "F":
    case "W":
    case "Y":
    case "L":
    case "I":
    case "V":
    case "M":
      return 1.4;

    // Polares sin carga / especiales
    case "S":
    case "T":
    case "N":
    case "Q":
    case "C":
    case "P":
      return 1.2;

    // Cargados
    case "D":
    case "E":
    case "K":
    case "R":
    case "H":
      return 1.3;

    // Otros pequeños / por defecto
    case "A":
    case "G":
    default:
      return 1.1;
  }
}
