/* ================ VARIABLEN UND KONSTANTEN ================ */

/* Konstanten für das Spiel */
const EMPTY = 0;
const HARD_WALL = 1;
const STONE = 2;
const WALL_WATER = 3;
const WALL_FIRE = 4;
const WALL_GRASS = 5;

const BOMB = 6;
const BOMB_WATER = 7;
const BOMB_FIRE = 8;
const BOMB_GRASS = 9;

const BOOST_BOMBRANGE = 10;
const BOOST_NEGATIVEBOMBRANGE = 11;
const BOOST_DIAGONAL = 12;
const BOOST_HORIZONTAL = 13;
const BOOST_LIFE = 14;

const ENEMY = 15;

/* Farbkonstanten */
const BLACK = "black";
const WHITE = "white";
const ENEMY_COLOR = "#ee303c";
const ENEMY_ARMOR_COLOR = "#a7a7a7";
const PLAYER_COLOR = "#e33f79";
const BOOST_COLOR = "#ffb800";
const FIRE_COLOR = "#ff9c5b";
const WATER_COLOR = "#3c8284";
const GRASS_COLOR = "#92c46d";
const FIXWALL_COLOR = "#034043";
const EXPLOSION_COLOR = "#ffa500";
const NOTHING_COLOR = "#fce5b3";
const BOMB_FUSE_COLOR = "#2c2c2c";
const HEART_COLOR = "#f5634a";
const HEARTLESS_COLOR = "#888888";
const INTERFACE_GREY = "#383838";
const WIN_COLOR = "#78ab52";
const LOSS_COLOR = "#900c3e";
const INTERFACE_CUTTER_COLOR = "#656565";

/* Spielkonstanten */
const START_LIFE = 3;
const STANDARD_BOMB_RANGE = 1;
const STANDARD_ACTIVE_BOMBS = 1;
const FIELD_STANDARD_SIZE = 18;
const RECTANGLE_SIZE = 50;
const FIELD_SIZE = 1200;
const START_TIME = 0;
const START_FINAL_TIME = 0;

const DESTRUCTIBLE_CHANCE = 30;

/* Wichtige Variablen für die Funktionen */
var time = START_TIME;

/* Definition des Spielers */
var spieler = {
  x: 0,
  y: 0,
  life: START_LIFE,
  activeBomb: STANDARD_ACTIVE_BOMBS,
  bombType: BOMB_WATER,
  bombrange: STANDARD_BOMB_RANGE,
};

/* Spielfeldinfos */
var fieldRect = RECTANGLE_SIZE;
var fieldSize = FIELD_SIZE;
var field = { x: FIELD_STANDARD_SIZE, y: FIELD_STANDARD_SIZE };

/* Erstelle 9x9-Array */
var spielfeldArray = new Array(field.x);
for (var b = 0; b < spielfeldArray.length; b++) {
  spielfeldArray[b] = new Array(field.y);
}

/* Pattern für das Spielfeld */
fieldPatterns = [
  [
    [EMPTY, EMPTY],
    [EMPTY, HARD_WALL],
  ],

  [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, HARD_WALL, HARD_WALL],
    [EMPTY, HARD_WALL, HARD_WALL],
  ],

  [
    [EMPTY, EMPTY, EMPTY],
    [HARD_WALL, EMPTY, HARD_WALL],
    [HARD_WALL, EMPTY, HARD_WALL],
  ],

  [
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, HARD_WALL, HARD_WALL, EMPTY, HARD_WALL],
    [EMPTY, EMPTY, EMPTY, EMPTY, HARD_WALL],
    [EMPTY, HARD_WALL, HARD_WALL, EMPTY, HARD_WALL],
    [EMPTY, HARD_WALL, HARD_WALL, EMPTY, HARD_WALL],
  ],
];

/* ================ EVENTLISTENER ================ */

var tutorial = false;
/* Eventlistener */
document.addEventListener("click", starter);
function starter(event) {
  if (
    event.x > 440 &&
    event.x < 440 + 210 &&
    event.y > 500 &&
    event.y < 500 + 100
  ) {
    document.removeEventListener("click", starter);
    startGame();
  } else if (
    event.x > 940 &&
    event.x < 940 + 140 &&
    event.y > 820 &&
    event.y < 820 + 50 &&
    !tutorial
  ) {
    showTutorial();
    tutorial = true;
  } else if (
    event.x > 940 &&
    event.x < 940 + 140 &&
    event.y > 820 &&
    event.y < 820 + 50 &&
    tutorial
  ) {
    startUp();
    tutorial = false;
  }
}

document.addEventListener("keydown", clicker);
/* Tastenbelegungen */
function clicker(event) {
  if (event.keyCode == 37) {
    //LINKS
    playerStep(-1, 0);
  } else if (event.keyCode == 38) {
    //OBEN
    playerStep(0, -1);
  } else if (event.keyCode == 39) {
    //RECHTS
    playerStep(1, 0);
  } else if (event.keyCode == 40) {
    //UNTEN
    playerStep(0, 1);
  } else if (event.keyCode == 32) {
    //LEERTASTE
    placeBomb(spieler.x, spieler.y);
  } else if (event.keyCode == 77) {
    //M
    switchBombType(spieler.x, spieler.y);
    drawBombMenu();
  }
}

/* ================ FUNKTIONEN ================ */

/* Checkt, ob Player */
function checkForPlayer(x, y) {
  if (x == spieler.x && y == spieler.y) {
    return true;
  } else {
    return false;
  }
}

/* Testet, ob es explodieren darf */
function checkForPossibleExplosion(x, y) {
  if (
    spielfeldArray[x][y].content == EMPTY ||
    hasBomb(x, y) ||
    hasBoost(x, y) ||
    isEnemy(x, y)
  ) {
    return true;
  } else {
    return false;
  }
}

/* Checkt, ob Wand */
function isWall(x, y) {
  if (
    spielfeldArray[x][y].content == HARD_WALL ||
    spielfeldArray[x][y].content == STONE ||
    spielfeldArray[x][y].content == WALL_WATER ||
    spielfeldArray[x][y].content == WALL_FIRE ||
    spielfeldArray[x][y].content == WALL_GRASS
  ) {
    return true;
  } else {
    return false;
  }
}

/* Checkt, ob die Wand zerstörbar ist */
function isDestructibleWall(x, y) {
  if (
    spielfeldArray[x][y].content == WALL_WATER ||
    spielfeldArray[x][y].content == WALL_FIRE ||
    spielfeldArray[x][y].content == WALL_GRASS
  ) {
    return true;
  } else {
    return false;
  }
}

/* Schaut, ob Bombe und Wände matchen */
function checkBombMatchingWall(x, y) {
  if (
    spielfeldArray[x][y].content == WALL_WATER &&
    spieler.bombType == BOMB_WATER
  ) {
    return true;
  } else if (
    spielfeldArray[x][y].content == WALL_FIRE &&
    spieler.bombType == BOMB_FIRE
  ) {
    return true;
  } else if (
    spielfeldArray[x][y].content == WALL_GRASS &&
    spieler.bombType == BOMB_GRASS
  ) {
    return true;
  } else {
    return false;
  }
}

/* Checkt, ob das gegebene Feld betreten werden kann */
function isEmpty(x, y) {
  if (
    typeof spielfeldArray[x][y] !== "undefined" &&
    (isWall(x, y) || hasBomb(x, y))
  ) {
    return false;
  } else {
    return true;
  }
}

/* Schaut, ob Boost vorhanden */
function hasBoost(x, y) {
  if (
    spielfeldArray[x][y].content == BOOST_BOMBRANGE ||
    spielfeldArray[x][y].content == BOOST_NEGATIVEBOMBRANGE ||
    spielfeldArray[x][y].content == BOOST_DIAGONAL ||
    spielfeldArray[x][y].content == BOOST_HORIZONTAL ||
    spielfeldArray[x][y].content == BOOST_LIFE
  ) {
    return true;
  } else {
    return false;
  }
}

/* Schaut, ob Bombe vorhanden */
function hasBomb(x, y) {
  if (
    spielfeldArray[x][y].content == BOMB_WATER ||
    spielfeldArray[x][y].content == BOMB_FIRE ||
    spielfeldArray[x][y].content == BOMB_GRASS
  ) {
    return true;
  } else {
    return false;
  }
}

/* Gibt den Typen des Boosts zurück */
function getBoostType(x, y) {
  if (spielfeldArray[x][y].content == BOOST_BOMBRANGE) {
    return BOOST_BOMBRANGE;
  } else if (spielfeldArray[x][y].content == BOOST_NEGATIVEBOMBRANGE) {
    return BOOST_NEGATIVEBOMBRANGE;
  } else if (spielfeldArray[x][y].content == BOOST_DIAGONAL) {
    return BOOST_DIAGONAL;
  } else if (spielfeldArray[x][y].content == BOOST_HORIZONTAL) {
    return BOOST_HORIZONTAL;
  } else if (spielfeldArray[x][y].content == BOOST_LIFE) {
    return BOOST_LIFE;
  }
}

/* Bombenwechsler */
function switchBombType() {
  if (spieler.bombType == BOMB_WATER) {
    spieler.bombType = BOMB_FIRE;
  } else if (spieler.bombType == BOMB_FIRE) {
    spieler.bombType = BOMB_GRASS;
  } else if (spieler.bombType == BOMB_GRASS) {
    spieler.bombType = BOMB_WATER;
  }
}

/* Zeichnet die Wände am Anfang */
function drawWalls() {
  for (let l = 0; l < spielfeldArray.length; l++) {
    for (let k = 0; k < spielfeldArray.length; k++) {
      a.beginPath();
      a.rect(l * fieldRect, k * fieldRect, fieldRect, fieldRect);
      if (spielfeldArray[l][k].content == HARD_WALL) {
        a.fillStyle = FIXWALL_COLOR;
      } else if (spielfeldArray[l][k].content == WALL_FIRE) {
        a.fillStyle = FIRE_COLOR;
      } else if (spielfeldArray[l][k].content == WALL_WATER) {
        a.fillStyle = WATER_COLOR;
      } else if (spielfeldArray[l][k].content == WALL_GRASS) {
        a.fillStyle = GRASS_COLOR;
      } else if (spielfeldArray[l][k].content == STONE) {
        a.fillStyle = FIXWALL_COLOR;
      } else if (spielfeldArray[l][k].content == EMPTY) {
        a.fillStyle = NOTHING_COLOR;
      }
      a.fill();
    }
  }
}

/* Bewegt den Spieler */
function playerStep(x, y) {
  if (hasBomb(spieler.x + x, spieler.y + y)) {
    kickBomb(spieler.x + x, spieler.y + y, "left");
  } else if (isEmpty(spieler.x + x, spieler.y + y)) {
    deletePlayer();
    if (hasBomb(spieler.x, spieler.y)) {
      drawBomb(spieler.x, spieler.y);
    } else if (isEnemy(spieler.x, spieler.y)) {
      drawEnemy(spieler.x, spieler.y);
    }
    spieler.x = spieler.x + x;
    spieler.y = spieler.y + y;
  }
  drawPlayer(spieler.x, spieler.y);
  checkPlayerEnemyCollision();
  checkForBoost();
}

/* Checkt, ob Enemy */
function isEnemy(x, y) {
  if (spielfeldArray[x][y].content == ENEMY) {
    return true;
  } else {
    return false;
  }
}

var gameover = false;
/* Legt eine Bombe */
function placeBomb(x, y) {
  if (!isEnemy(x, y)) {
    spielfeldArray[x][y].content = spieler.bombType;
    drawBomb(x, y);
    setTimeout(function () {
      if (hasBomb(x, y) && !gameover) {
        bombExplode(x, y, spieler.activeBomb);
      }
    }, 3000);
  }
}

/* Handlet die Explosion */
function explosionHandler(x, y) {
  if (checkBombMatchingWall(x, y)) {
    drawExplosion(x, y);

    setTimeout(function () {
      drawImplosion(x, y);
      if (hasBoost(x, y)) {
        drawBoost(x, y);
      }
    }, 200);

    return true;
  } else if (checkForPossibleExplosion(x, y)) {
    drawExplosion(x, y);

    setTimeout(function () {
      drawImplosion(x, y);
      if (hasBoost(x, y)) {
        drawBoost(x, y);
      } else if (checkForPlayer(x, y)) {
        drawPlayer(x, y);
      } else if (isEnemy(x, y)) {
        drawEnemy(x, y);
      }
    }, 200);

    return false;
  } else {
    return false;
  }
}

/* Checkt, ob die Bombe durch Explosion berührt wird */
function checkBombExplode(x, y) {
  if (hasBomb(x, y)) {
    setTimeout(function () {
      bombExplode(x, y, spieler.activeBomb);
    }, 200);
  }
}

/* Regelt alles, was bei einer Explosion passiert */
function shockwaveHandler(x, y) {
  explosionHandler(x, y);

  checkPlayerExplode(x, y);
  checkEnemyExplode(x, y);
  checkBoostCollision(x, y);
  checkBombExplode(x, y);
}

/* Lässt Bombe explodieren */
function bombExplode(x, y, bombtype) {
  explosionHandler(x, y);
  spielfeldArray[x][y].content = EMPTY;

  let rightFree = true;
  let topFree = true;
  let botFree = true;
  let leftFree = true;

  for (let p = 1; p <= spieler.bombrange; p++) {
    if (
      bombtype == 1 &&
      botFree &&
      (checkBombMatchingWall(x, y + p) || !isWall(x, y + p))
    ) {
      shockwaveHandler(x, y + p);
      if (isDestructibleWall(x, y + p)) {
        botFree = false;
        spielfeldArray[x][y + p].content = randomizeItemDrop(x, y + p);
      }
    } else if (
      bombtype == 2 &&
      botFree &&
      (checkBombMatchingWall(x + p, y + p) || !isWall(x + p, y + p))
    ) {
      shockwaveHandler(x + p, y + p);
      if (isDestructibleWall(x + p, y + p)) {
        botFree = false;
        spielfeldArray[x + p][y + p].content = randomizeItemDrop(x + p, y + p);
      }
    } else {
      botFree = false;
    }

    if (
      bombtype == 1 &&
      topFree &&
      (checkBombMatchingWall(x, y - p) || !isWall(x, y - p))
    ) {
      shockwaveHandler(x, y - p);
      if (isDestructibleWall(x, y - p)) {
        topFree = false;
        spielfeldArray[x][y - p].content = randomizeItemDrop(x, y - p);
      }
    } else if (
      bombtype == 2 &&
      topFree &&
      (checkBombMatchingWall(x - p, y - p) || !isWall(x - p, y - p))
    ) {
      shockwaveHandler(x - p, y - p);
      if (isDestructibleWall(x - p, y - p)) {
        topFree = false;
        spielfeldArray[x - p][y - p].content = randomizeItemDrop(x - p, y - p);
      }
    } else {
      topFree = false;
    }

    if (
      bombtype == 1 &&
      leftFree &&
      (checkBombMatchingWall(x - p, y) || !isWall(x - p, y))
    ) {
      shockwaveHandler(x - p, y);
      if (isDestructibleWall(x - p, y)) {
        leftFree = false;
        spielfeldArray[x - p][y].content = randomizeItemDrop(x - p, y);
      }
    } else if (
      bombtype == 2 &&
      leftFree &&
      (checkBombMatchingWall(x - p, y + p) || !isWall(x - p, y + p))
    ) {
      shockwaveHandler(x - p, y + p);
      if (isDestructibleWall(x - p, y + p)) {
        leftFree = false;
        spielfeldArray[x - p][y + p].content = randomizeItemDrop(x - p, y + p);
      }
    } else {
      leftFree = false;
    }

    if (
      bombtype == 1 &&
      rightFree &&
      (checkBombMatchingWall(x + p, y) || !isWall(x + p, y))
    ) {
      shockwaveHandler(x + p, y);
      if (isDestructibleWall(x + p, y)) {
        rightFree = false;
        spielfeldArray[x + p][y].content = randomizeItemDrop(x + p, y);
      }
    } else if (
      bombtype == 2 &&
      rightFree &&
      (checkBombMatchingWall(x + p, y - p) || !isWall(x + p, y - p))
    ) {
      shockwaveHandler(x + p, y - p);
      if (isDestructibleWall(x + p, y - p)) {
        rightFree = false;
        spielfeldArray[x + p][y - p].content = randomizeItemDrop(x + p, y - p);
      }
    } else {
      rightFree = false;
    }
  }
}

/* Schießt die Bombe in eine Richtung */
function kickBomb(x, y, direction) {
  let temp;
  let d = 1;

  if (direction == "top") {
    var interval = setInterval(function () {
      if (y - d > 0 && spielfeldArray[x][y - d].content == EMPTY) {
        spielfeldArray[x][y - d + 1].content = EMPTY;
        deleteBomb(x, y - d + 1);
        spielfeldArray[x][y - d].content = spieler.bombType;
        temp = y - d;
        placeBomb(x, temp);
        d++;
      }
      if (
        isWall(x, y - d) ||
        isEnemy(x, y - d) ||
        hasBomb(x, y - d) ||
        hasBoost(x, y - d)
      ) {
        clearInterval(interval);
      }
    }, 150);
  } else if (direction == "right") {
    var interval = setInterval(function () {
      if (x + d > 0 && spielfeldArray[x + d][y].content == EMPTY) {
        spielfeldArray[x + d - 1][y].content = EMPTY;
        deleteBomb(x + d - 1, y);
        spielfeldArray[x + d][y].content = spieler.bombType;
        temp = x + d;
        placeBomb(temp, y);
        d++;
      }
      if (
        isWall(x + d, y) ||
        isEnemy(x + d, y) ||
        hasBomb(x + d, y) ||
        hasBoost(x + d, y)
      ) {
        clearInterval(interval);
      }
    }, 150);
  } else if (direction == "bot") {
    var interval = setInterval(function () {
      if (y + d > 0 && spielfeldArray[x][y + d].content == EMPTY) {
        spielfeldArray[x][y + d - 1].content = EMPTY;
        deleteBomb(x, y + d - 1);
        spielfeldArray[x][y + d].content = spieler.bombType;
        temp = y + d;
        placeBomb(x, temp);
        d++;
      }
      if (
        isWall(x, y + d) ||
        isEnemy(x, y + d) ||
        hasBomb(x, y + d) ||
        hasBoost(x, y + d)
      ) {
        clearInterval(interval);
      }
    }, 150);
  } else {
    var interval = setInterval(function () {
      if (x - d > 0 && spielfeldArray[x - d][y].content == EMPTY) {
        spielfeldArray[x - d + 1][y].content = EMPTY;
        deleteBomb(x - d + 1, y);
        spielfeldArray[x - d][y].content = spieler.bombType;
        temp = x - d;
        placeBomb(temp, y);
        d++;
      }
      if (
        isWall(x - d, y) ||
        isEnemy(x - d, y) ||
        hasBomb(x - d, y) ||
        hasBoost(x - d, y)
      ) {
        clearInterval(interval);
      }
    }, 150);
  }
}

/* Lost aus, ob Items droppen */
function randomizeItemDrop(x, y) {
  let randomBoost = getRandomInt(100);
  if (randomBoost < 5) {
    console.log("Return BOOST_BOMBRANGE");
    return BOOST_BOMBRANGE;
  } else if (randomBoost < 10) {
    console.log("Return BOOST_NEGATIVEBOMBRANGE");
    return BOOST_NEGATIVEBOMBRANGE;
  } else if (randomBoost < 15) {
    console.log("Return BOOST_DIAGONAL");
    return BOOST_DIAGONAL;
  } else if (randomBoost < 20) {
    console.log("Return BOOST_HORIZONTAL");
    return BOOST_HORIZONTAL;
  } else if (randomBoost < 25) {
    console.log("Return BOOST_LIFE");
    return BOOST_LIFE;
  } else {
    return EMPTY;
  }
}

/* Prüft, ob der Spieler explodiert */
function checkPlayerExplode(x, y) {
  if (checkForPlayer(x, y)) {
    spieler.life--;
    showLife();
    showDmgMarker();
    checkForLoss();
  }
}

/* Zerstört Item bei berührung */
function checkBoostCollision(x, y) {
  if (hasBoost(x, y)) {
    spielfeldArray[x][y].content = EMPTY;
  }
}

var enemyDmgMarker = false;
/* Prüft, ob Player und Enemy sich berühren */
function checkPlayerEnemyCollision() {
  if (isEnemy(spieler.x, spieler.y) && !enemyDmgMarker) {
    spieler.life--;
    enemyDmgMarker = true;
    showLife();
    showDmgMarker();
    checkForLoss();
    setTimeout(function () {
      if (enemyDmgMarker) {
        enemyDmgMarker = false;
      }
    }, 1000 * getEnemy(spieler.x, spieler.y).speed);
  }
}

/* Startet das Füllen des SpielfeldArrays */
function start() {
  setFieldObjects();
  setNeighbors();
  setOuterWalls();
}

/* Füllt das Array mit Objecten */
function setFieldObjects() {
  for (let x = 0; x < field.x; x++) {
    for (let y = 0; y < field.y; y++) {
      let object = new Object();
      object.x = x;
      object.y = y;
      object.content = EMPTY;
      spielfeldArray[x][y] = object;
    }
  }
}

/* Setzt die Nachbarn der Felder */
function setNeighbors() {
  for (let y = 0; y < field.x; y++) {
    for (let x = 0; x < field.y; x++) {
      if (!(y - 1 < 0)) {
        //TOP
        spielfeldArray[x][y].north = spielfeldArray[x][y - 1];
      } else {
        spielfeldArray[x][y].north = 0;
      }

      if (!(y + 1 >= spielfeldArray.length)) {
        //BOT
        spielfeldArray[x][y].south = spielfeldArray[x][y + 1];
      } else {
        spielfeldArray[x][y].south = 0;
      }

      if (!(x + 1 >= spielfeldArray.length)) {
        //RIGHT
        spielfeldArray[x][y].ost = spielfeldArray[x + 1][y];
      } else {
        spielfeldArray[x][y].ost = 0;
      }

      if (!(x - 1 < 0)) {
        //LEFT
        spielfeldArray[x][y].west = spielfeldArray[x - 1][y];
      } else {
        spielfeldArray[x][y].west = 0;
      }
    }
  }
}

/* Setzt die Außenwände des Spielfeldes */
function setOuterWalls() {
  for (let b = 0; b < field.x; b++) {
    for (let a = 0; a < field.y; a++) {
      if (
        spielfeldArray[a][b].north == 0 ||
        spielfeldArray[a][b].south == 0 ||
        spielfeldArray[a][b].ost == 0 ||
        spielfeldArray[a][b].west == 0
      ) {
        spielfeldArray[a][b].content = HARD_WALL;
      }
    }
  }
}

/* Checkt, ob ein Spieler einen Boost aufnimmt */
function checkForBoost() {
  if (hasBoost(spieler.x, spieler.y)) {
    if (getBoostType(spieler.x, spieler.y) == BOOST_BOMBRANGE) {
      spieler.bombrange++;
    } else if (getBoostType(spieler.x, spieler.y) == BOOST_NEGATIVEBOMBRANGE) {
      if (spieler.bombrange > 1) {
        spieler.bombrange--;
      }
    } else if (getBoostType(spieler.x, spieler.y) == BOOST_DIAGONAL) {
      spieler.activeBomb = 2;
    } else if (getBoostType(spieler.x, spieler.y) == BOOST_HORIZONTAL) {
      spieler.activeBomb = 1;
    } else if (getBoostType(spieler.x, spieler.y) == BOOST_LIFE) {
      if (spieler.life < 3) {
        spieler.life++;
        showLife();
      }
    }
    spielfeldArray[spieler.x][spieler.y].content = EMPTY;
    deleteBoost(spieler.x, spieler.y);
  }
  drawPlayer(spieler.x, spieler.y);
}

/* Generiert einen ganzzahligen Randomint */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* Gibt ein zufälliges Pattern zurück */
function returnFieldPattern() {
  return fieldPatterns[getRandomInt(fieldPatterns.length)];
}

/* Spielfelder setzen */
function setSpielfeld() {
  let randomField = returnFieldPattern();

  for (let x = 1; x < field.y - 1; x++) {
    for (let y = 1; y < field.x - 1; y++) {
      if (randomField[x % randomField.length][y % randomField.length] == 1) {
        spielfeldArray[x][y].content = STONE;
      }
    }
  }
  setDestructibleWalls();
  setPlayerStart();
}

/* Fügt zerstörbare Wände hinzu */
function setDestructibleWalls() {
  for (let x = 1; x < field.x - 1; x++) {
    for (let y = 1; y < field.y - 1; y++) {
      let random = getRandomInt(100);
      if (
        random < DESTRUCTIBLE_CHANCE &&
        spielfeldArray[x][y].content != STONE
      ) {
        if (random < DESTRUCTIBLE_CHANCE / 3) {
          spielfeldArray[x][y].content = WALL_FIRE;
        } else if (random < DESTRUCTIBLE_CHANCE / 2) {
          spielfeldArray[x][y].content = WALL_WATER;
        } else if (random < DESTRUCTIBLE_CHANCE) {
          spielfeldArray[x][y].content = WALL_GRASS;
        }
      }
    }
  }
}

/* Fügt den Start des Spielers hinzu */
function setPlayerStart() {
  while (spieler.x == 0 && spieler.y == 0) {
    let randomX = getRandomInt(field.x);
    let randomY = getRandomInt(field.y);
    if (isEmpty(randomX, randomY) && isLegalPlayerStart(randomX, randomY)) {
      spieler.x = randomX;
      spieler.y = randomY;
      break;
    }
  }
}

/* Prüft, ob der Spieler Lebens aus dem Spawn heraus kommt */
function isLegalPlayerStart(x, y) {
  if (
    (isEmpty(x + 1, y) || isEmpty(x - 1, y)) &&
    isEmpty(x, y + 1) &&
    isEmpty(x, y + 2)
  ) {
    return true;
  } else if (
    isEmpty(x - 1, y) &&
    isEmpty(x - 1, y + 1) &&
    isEmpty(x - 1, y + 2)
  ) {
    return true;
  } else if (
    isEmpty(x + 1, y) &&
    isEmpty(x + 1, y + 1) &&
    isEmpty(x + 1, y + 2)
  ) {
    return true;
  } else if (isEmpty(x, y - 1) && isEmpty(x + 1, y - 1) && isEmpty(x, y + 1)) {
    return true;
  } else if (
    (isEmpty(x - 1, y - 1) || isEmpty(x + 1, y - 1)) &&
    isEmpty(x, y - 1) &&
    isEmpty(x, y + 1)
  ) {
    return true;
  } else if (
    (isEmpty(x + 1, y - 2) || isEmpty(x - 1, y - 2)) &&
    isEmpty(x, y - 1) &&
    isEmpty(x, y - 2)
  ) {
    return true;
  } else if (
    isEmpty(x, y + 1) &&
    isEmpty(x + 1, y + 1) &&
    isEmpty(x + 2, y + 1)
  ) {
    return true;
  } else if (
    isEmpty(x, y + 1) &&
    isEmpty(x - 1, y + 1) &&
    isEmpty(x - 2, y + 1)
  ) {
    return true;
  } else if (isEmpty(x, y - 1) && isEmpty(x + 1, y) && isEmpty(x + 2, y)) {
    return true;
  } else if (isEmpty(x, y - 1) && isEmpty(x - 1, y) && isEmpty(x - 2, y)) {
    return true;
  } else if (isEmpty(x - 1, y - 1) && isEmpty(x - 1, y) && isEmpty(x + 1, y)) {
    return true;
  } else if (isEmpty(x + 1, y + 1) && isEmpty(x + 1, y) && isEmpty(x - 1, y)) {
    return true;
  } else if (isEmpty(x - 1, y) && isEmpty(x - 2, y) && isEmpty(x - 2, y - 1)) {
    return true;
  } else if (isEmpty(x + 1, y) && isEmpty(x + 2, y) && isEmpty(x + 2, y - 1)) {
    return true;
  } else {
    return false;
  }
}

/* === GEGNER === */

var enemyArray;
/* Erstellt Gegner */
function createEnemies() {
  let enemyCount = getRandomInt(10) + 5;

  enemyArray = new Array(enemyCount);

  for (let b = 0; b < enemyArray.length; b++) {
    let enemy = new Object();
    enemy.speed = Math.random() + 1;
    enemy.alive = getRandomInt(3) + 1;
    enemyArray[b] = enemy;
  }
  placeEnemies();
}

/* Killt alle Gegner */
function killAllEnemies() {
  for (let i = 0; i < enemyArray.length; i++) {
    enemyArray[i].alive = 0;
  }
}

/* Setzt Gegner zufällig */
function placeEnemies() {
  for (let b = 0; b < enemyArray.length; b++) {
    do {
      var enemyX = getRandomInt(field.x - 1) + 1;
      var enemyY = getRandomInt(field.y - 1) + 1;
    } while (!legalEnemySpawn(enemyX, enemyY));

    enemyArray[b].x = enemyX;
    enemyArray[b].y = enemyY;

    spielfeldArray[enemyX][enemyY].content = ENEMY;

    moveEnemy(enemyArray[b]);
  }
}

/* Definiert legale Spawns für Gegner */
function legalEnemySpawn(x, y) {
  if (spielfeldArray[x][y].content != 0) {
    return false;
  } else if (
    checkForPlayer(x, y) ||
    (x - 1 == spieler.x && y == spieler.y) ||
    (x + 1 == spieler.x && y == spieler.y) ||
    (x == spieler.x && y - 1 == spieler.y) ||
    (x == spieler.x && y + 1 == spieler.y) ||
    (x - 1 == spieler.x && y - 1 == spieler.y) ||
    (x + 1 == spieler.x && y - 1 == spieler.y) ||
    (x - 1 == spieler.x && y + 1 == spieler.y) ||
    (x + 1 == spieler.x && y + 1 == spieler.y)
  ) {
    return false;
  } else if (
    spielfeldArray[x - 1][y].content == WALL_WATER ||
    spielfeldArray[x - 1][y].content == WALL_FIRE ||
    spielfeldArray[x - 1][y].content == WALL_GRASS ||
    spielfeldArray[x + 1][y].content == WALL_WATER ||
    spielfeldArray[x + 1][y].content == WALL_FIRE ||
    spielfeldArray[x + 1][y].content == WALL_GRASS ||
    spielfeldArray[x][y + 1].content == WALL_WATER ||
    spielfeldArray[x][y + 1].content == WALL_FIRE ||
    spielfeldArray[x][y + 1].content == WALL_GRASS ||
    spielfeldArray[x][y - 1].content == WALL_WATER ||
    spielfeldArray[x][y - 1].content == WALL_FIRE ||
    spielfeldArray[x][y - 1].content == WALL_GRASS
  ) {
    return false;
  } else {
    return true;
  }
}

/* Bewegt die Gegner */
function moveEnemy(enemy) {
  setTimeout(function () {
    let movearray = new Array();

    if (isEmpty(enemy.x, enemy.y - 1) && !isEnemy(enemy.x, enemy.y - 1)) {
      //TOP
      movearray.push(0);
    }
    if (isEmpty(enemy.x + 1, enemy.y) && !isEnemy(enemy.x + 1, enemy.y)) {
      //RIGHT
      movearray.push(1);
    }
    if (isEmpty(enemy.x, enemy.y + 1) && !isEnemy(enemy.x, enemy.y + 1)) {
      //BOT
      movearray.push(2);
    }
    if (isEmpty(enemy.x - 1, enemy.y) && !isEnemy(enemy.x - 1, enemy.y)) {
      //LEFT
      movearray.push(3);
    }

    if (typeof movearray !== "undefined" && movearray.length > 0) {
      if (enemy.alive >= 1) {
        let direction = getRandomInt(movearray.length);

        spielfeldArray[enemy.x][enemy.y].content = EMPTY;
        deleteEnemy(enemy.x, enemy.y);

        if (movearray[direction] == 0) {
          //TOP
          enemy.y = enemy.y - 1;
        } else if (movearray[direction] == 1) {
          //RIGHT
          enemy.x = enemy.x + 1;
        } else if (movearray[direction] == 2) {
          //BOT
          enemy.y = enemy.y + 1;
        } else if (movearray[direction] == 3) {
          //LEFT
          enemy.x = enemy.x - 1;
        }

        spielfeldArray[enemy.x][enemy.y].content = ENEMY;
        checkPlayerEnemyCollision();
        checkBoostCollision(enemy.x, enemy.y);
        notStepped = false;
      }
    }

    if (enemy.alive > 0) {
      drawEnemy(enemy.x, enemy.y);
      moveEnemy(enemy);
    }
  }, 1000 * enemy.speed);
}

/* Gibt einen bestimmten Gegner aus */
function getEnemy(x, y) {
  for (let i = 0; i < enemyArray.length; i++) {
    if (enemyArray[i].x == x && enemyArray[i].y == y) {
      return enemyArray[i];
    }
  }
}

/* Prüft, ob ein Gegner explodiert */
function checkEnemyExplode(x, y) {
  if (isEnemy(x, y)) {
    getEnemy(x, y).alive--;
    if (getEnemy(x, y).alive == 0) {
      setTimeout(function () {
        deleteEnemy(x, y);
      }, 200);
    } else {
      drawEnemy(x, y);
    }
  }
  checkForWin();
}

var timerInterval;
/* Prüft, ob ein Spiel gewonnen wurde */
function checkForWin() {
  let counter = 0;
  for (let s = 0; s < enemyArray.length; s++) {
    if (enemyArray[s].alive) {
      counter++;
    }
  }
  if (counter == 0) {
    setTimeout(function () {
      clearInterval(timerInterval);
      gameover = true;
      showWin();
    }, 400);
  }
}

/* Testet, ob verloren wurde */
function checkForLoss() {
  if (spieler.life == 0) {
    setTimeout(function () {
      document.getElementById("wall").style.borderColor = INTERFACE_GREY;
      clearInterval(timerInterval);
      killAllEnemies();
      gameover = true;
      showLoss();
    }, 400);
  }
}

/* Startet den Timer */
function startTimer() {
  timerInterval = setInterval(function () {
    time = time + 1000;
    drawTimer();
  }, 1000);
}

/* Formatiere Zeit zweistellig */
function formatTime(zeit) {
  if (zeit < 10) {
    return "0" + zeit;
  } else {
    return zeit;
  }
}

/* Game-Startup */
function startGame() {
  start();
  setSpielfeld();
  drawWalls();
  drawPlayer(spieler.x, spieler.y);
  createEnemies();
  showInterface();
}

/* ================ INTERFACE ================ */

/* Zeichnet die Bombe */
function drawBomb(x, y) {
  a.beginPath();
  a.moveTo(x * fieldRect + 21, y * fieldRect + fieldRect / 2 + 5);
  a.lineTo(x * fieldRect + 38, y * fieldRect + fieldRect / 2 - 17);
  a.lineWidth = "4";
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(x * fieldRect + 17, y * fieldRect + fieldRect / 2 - 5);
  a.lineTo(x * fieldRect + 28, y * fieldRect + fieldRect / 2 - 12);
  a.lineTo(x * fieldRect + 36, y * fieldRect + fieldRect / 2 - 4);
  a.lineTo(x * fieldRect + 20, y * fieldRect + fieldRect / 2 + 10);
  a.lineWidth = "10";
  a.closePath();
  if (spieler.bombType == BOMB_WATER) {
    a.fillStyle = WATER_COLOR;
  } else if (spieler.bombType == BOMB_FIRE) {
    a.fillStyle = FIRE_COLOR;
  } else if (spieler.bombType == BOMB_GRASS) {
    a.fillStyle = GRASS_COLOR;
  }
  a.fill();

  a.beginPath();
  a.arc(
    x * fieldRect + 21,
    y * fieldRect + fieldRect / 2 + 5,
    16,
    0,
    2 * Math.PI
  );
  if (spieler.bombType == BOMB_WATER) {
    a.fillStyle = WATER_COLOR;
  } else if (spieler.bombType == BOMB_FIRE) {
    a.fillStyle = FIRE_COLOR;
  } else if (spieler.bombType == BOMB_GRASS) {
    a.fillStyle = GRASS_COLOR;
  }
  a.fill();
}

/* Zeichnet den Spieler */
function drawPlayer() {
  a.beginPath();
  a.arc(
    spieler.x * fieldRect + fieldRect / 2,
    spieler.y * fieldRect + fieldRect / 2,
    20,
    0,
    2 * Math.PI
  );
  a.fillStyle = PLAYER_COLOR;
  a.fill();
}

/* Zeichnet die Explosion */
function drawExplosion(x, y) {
  a.beginPath();
  a.rect(x * fieldRect, y * fieldRect, fieldRect, fieldRect);
  a.fillStyle = EXPLOSION_COLOR;
  a.fill();
}

/* Zeichnet die Implosion ZEICHNET LEERES FELD */
function drawImplosion(x, y) {
  a.beginPath();
  a.rect(x * fieldRect, y * fieldRect, fieldRect, fieldRect);
  a.fillStyle = NOTHING_COLOR;
  a.fill();
}

/* Zeichnet LEERES FELD */
function deleteBomb(x, y) {
  a.beginPath();
  a.rect(x * fieldRect, y * fieldRect, fieldRect, fieldRect);
  a.fillStyle = NOTHING_COLOR;
  a.fill();
}

/* Zeichnet den Boost */
function drawBoost(x, y) {
  a.beginPath();
  a.moveTo(x * fieldRect + fieldRect / 2, y * fieldRect + 7);
  a.lineTo(x * fieldRect + 7, y * fieldRect + fieldRect - 7);
  a.lineTo(x * fieldRect + fieldRect - 7, y * fieldRect + fieldRect - 7);
  a.closePath();
  a.fillStyle = BOOST_COLOR;
  a.fill();

  if (getBoostType(x, y) == BOOST_BOMBRANGE) {
    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2, y * fieldRect + 23);
    a.lineTo(x * fieldRect + fieldRect / 2, y * fieldRect + 38);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();

    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2 - 5, y * fieldRect + 28);
    a.lineTo(x * fieldRect + fieldRect / 2, y * fieldRect + 23);
    a.lineTo(x * fieldRect + fieldRect / 2 + 5, y * fieldRect + 28);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();
  } else if (getBoostType(x, y) == BOOST_NEGATIVEBOMBRANGE) {
    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2, y * fieldRect + 23);
    a.lineTo(x * fieldRect + fieldRect / 2, y * fieldRect + 38);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();

    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2 - 5, y * fieldRect + 33);
    a.lineTo(x * fieldRect + fieldRect / 2, y * fieldRect + 38);
    a.lineTo(x * fieldRect + fieldRect / 2 + 5, y * fieldRect + 33);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();
  } else if (getBoostType(x, y) == BOOST_DIAGONAL) {
    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2 - 6, y * fieldRect + 26);
    a.lineTo(x * fieldRect + fieldRect / 2 + 7, y * fieldRect + 38);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();

    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2 + 6, y * fieldRect + 26);
    a.lineTo(x * fieldRect + fieldRect / 2 - 7, y * fieldRect + 38);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();
  } else if (getBoostType(x, y) == BOOST_HORIZONTAL) {
    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2, y * fieldRect + 26);
    a.lineTo(x * fieldRect + fieldRect / 2, y * fieldRect + 38);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();

    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2 - 6, y * fieldRect + 32);
    a.lineTo(x * fieldRect + fieldRect / 2 + 6, y * fieldRect + 32);
    a.lineWidth = 3;
    a.strokeStyle = WHITE;
    a.stroke();
  } else if (getBoostType(x, y) == BOOST_LIFE) {
    a.beginPath();
    a.arc(
      x * fieldRect + fieldRect / 2 - 4,
      y * fieldRect + 29,
      4,
      0,
      2 * Math.PI
    );
    a.arc(
      x * fieldRect + fieldRect / 2 + 4,
      y * fieldRect + 29,
      4,
      0,
      2 * Math.PI
    );
    a.fillStyle = WHITE;
    a.fill();

    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect / 2 - 7, y * fieldRect + 31);
    a.lineTo(x * fieldRect + fieldRect / 2, y * fieldRect + 39);
    a.lineTo(x * fieldRect + fieldRect / 2 + 7, y * fieldRect + 31);
    a.lineTo(x * fieldRect + fieldRect / 2 + 5, y * fieldRect + 29);
    a.lineTo(x * fieldRect + fieldRect / 2 - 5, y * fieldRect + 29);
    a.closePath();
    a.fillStyle = WHITE;
    a.fill();
  }
}

/* Löscht einen Boost */
function deleteBoost(x, y) {
  a.beginPath();
  a.rect(spieler.x * fieldRect, spieler.y * fieldRect, fieldRect, fieldRect);
  a.fillStyle = NOTHING_COLOR;
  a.fill();
}

/* Löscht einen Spieler auf einem Feld */
function deletePlayer() {
  a.beginPath();
  a.rect(spieler.x * fieldRect, spieler.y * fieldRect, fieldRect, fieldRect);
  a.fillStyle = NOTHING_COLOR;
  a.fill();
}

/* Zeichnet den Gegner */
function drawEnemy(x, y) {
  a.beginPath();
  a.arc(
    x * fieldRect + fieldRect / 2,
    y * fieldRect + fieldRect / 2 + 3,
    17,
    0,
    2 * Math.PI
  );
  a.fillStyle = ENEMY_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(x * fieldRect + 10, y * fieldRect + 3);
  a.lineTo(x * fieldRect + 12, y * fieldRect + 20);
  a.lineTo(x * fieldRect + 25, y * fieldRect + 12);
  a.closePath();
  a.fillStyle = ENEMY_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo((x + 1) * fieldRect - 10, y * fieldRect + 3);
  a.lineTo((x + 1) * fieldRect - 12, y * fieldRect + 20);
  a.lineTo((x + 1) * fieldRect - 25, y * fieldRect + 12);
  a.closePath();
  a.fillStyle = ENEMY_COLOR;
  a.fill();

  if (getEnemy(x, y).alive > 1) {
    a.beginPath();
    a.moveTo(
      x * fieldRect + fieldRect / 2 + 15,
      y * fieldRect + fieldRect / 2 + 7
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 7,
      y * fieldRect + fieldRect / 2 + 5
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 7,
      y * fieldRect + fieldRect / 2 + 15
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 15,
      y * fieldRect + fieldRect / 2 + 23
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 23,
      y * fieldRect + fieldRect / 2 + 15
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 23,
      y * fieldRect + fieldRect / 2 + 5
    );
    a.closePath();
    a.fillStyle = ENEMY_ARMOR_COLOR;
    a.fill();
  }

  if (getEnemy(x, y).alive == 2) {
    a.beginPath();
    a.moveTo(
      x * fieldRect + fieldRect / 2 + 17,
      y * fieldRect + fieldRect / 2 + 7
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 12,
      y * fieldRect + fieldRect / 2 + 12
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 16,
      y * fieldRect + fieldRect / 2 + 15
    );
    a.lineTo(
      x * fieldRect + fieldRect / 2 + 14,
      y * fieldRect + fieldRect / 2 + 18
    );
    a.strokeStyle = BLACK;
    a.lineWidth = "1";
    a.stroke();
  }

  if (getEnemy(x, y).alive == 3) {
    a.beginPath();
    a.moveTo(x * fieldRect + 8, y * fieldRect + 2);
    a.lineTo(x * fieldRect + 9, y * fieldRect + 16);
    a.lineTo(x * fieldRect + 24, y * fieldRect + 8);
    a.closePath();
    a.fillStyle = ENEMY_ARMOR_COLOR;
    a.fill();

    a.beginPath();
    a.moveTo(x * fieldRect + fieldRect - 8, y * fieldRect + 2);
    a.lineTo(x * fieldRect + fieldRect - 9, y * fieldRect + 16);
    a.lineTo(x * fieldRect + fieldRect - 24, y * fieldRect + 8);
    a.closePath();
    a.fillStyle = ENEMY_ARMOR_COLOR;
    a.fill();
  }
}

/* Löscht einen Gegner */
function deleteEnemy(x, y) {
  spielfeldArray[x][y].content = EMPTY;
  a.beginPath();
  a.rect(x * fieldRect, y * fieldRect, fieldRect, fieldRect);
  a.fillStyle = NOTHING_COLOR;
  a.fill();
  if (x == spieler.x && y == spieler.y) {
    drawPlayer(x, y);
  }
}

/* Grundlage für das rechte Interface */
function showInterface() {
  a.beginPath();
  a.rect(900, 0, fieldSize, fieldSize);
  a.fillStyle = INTERFACE_GREY;
  a.fill();

  startTimer();
  drawBombMenu();
  showLife();
}

var finalTime = START_FINAL_TIME;
/* Zeichhnet den Timer */
function drawTimer() {
  let minutes = formatTime(Math.floor(time / (1000 * 60)));
  let seconds = formatTime((time % (1000 * 60)) / 1000);

  finalTime = minutes + ":" + seconds;

  a.beginPath();
  a.rect(920, 20, 160, 140);
  a.fillStyle = INTERFACE_GREY;
  a.fill();

  a.beginPath();
  a.font = "40px Calibri";
  a.fillStyle = WHITE;
  a.textAlign = "center";
  a.fillText(finalTime, 1000, 120);

  a.beginPath();
  a.font = "20px Calibri";
  a.fillStyle = WHITE;
  a.textAlign = "center";
  a.fillText("Timer", 1000, 80);
}

/* Zeigt die derzeit ausgewählte Bombe an */
function drawBombMenu() {
  a.beginPath();
  a.rect(900, 680, 250, 450);
  a.fillStyle = INTERFACE_GREY;
  a.fill();

  a.beginPath();
  a.moveTo(910, 648);
  a.lineTo(1090, 648);
  a.lineWidth = 3;
  a.strokeStyle = INTERFACE_CUTTER_COLOR;
  a.stroke();

  a.beginPath();
  a.font = "20px Calibri";
  a.fillStyle = WHITE;
  a.textAlign = "center";
  a.fillText("Bombe", 1000, 705);

  a.beginPath();
  a.moveTo(1000, 800);
  a.lineTo(1060, 720);
  a.lineWidth = 10;
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(990, 780);
  a.lineTo(1025, 735);
  a.lineTo(1056, 756);
  a.lineTo(1000, 830);
  a.lineWidth = "1";
  a.closePath();
  if (spieler.bombType == BOMB_WATER) {
    a.fillStyle = WATER_COLOR;
  } else if (spieler.bombType == BOMB_FIRE) {
    a.fillStyle = FIRE_COLOR;
  } else if (spieler.bombType == BOMB_GRASS) {
    a.fillStyle = GRASS_COLOR;
  }
  a.fill();

  a.beginPath();
  a.arc(1000, 800, 50, 0, 2 * Math.PI);
  if (spieler.bombType == BOMB_WATER) {
    a.fillStyle = WATER_COLOR;
  } else if (spieler.bombType == BOMB_FIRE) {
    a.fillStyle = FIRE_COLOR;
  } else if (spieler.bombType == BOMB_GRASS) {
    a.fillStyle = GRASS_COLOR;
  }
  a.fill();
}

/* Zeigt die Lebensanzeige an */
function showLife() {
  a.beginPath();
  a.rect(900, 200, 250, 420);
  a.fillStyle = INTERFACE_GREY;
  a.fill();

  a.beginPath();
  a.moveTo(910, 170);
  a.lineTo(1090, 170);
  a.lineWidth = 3;
  a.strokeStyle = INTERFACE_CUTTER_COLOR;
  a.stroke();

  a.beginPath();
  a.font = "20px Calibri";
  a.fillStyle = WHITE;
  a.textAlign = "center";
  a.fillText("Leben", 1000, 220);

  a.beginPath();
  a.arc(980, 270, 25, 0, 2 * Math.PI);
  a.arc(1028, 270, 25, 0, 2 * Math.PI);
  if (spieler.life > 0) {
    a.fillStyle = HEART_COLOR;
  } else {
    a.fillStyle = HEARTLESS_COLOR;
  }
  a.fill();

  a.beginPath();
  a.moveTo(957, 280);
  a.lineTo(1005, 350);
  a.lineTo(1051, 280);
  a.lineTo(1030, 260);
  a.lineWidth = "1";
  a.closePath();
  if (spieler.life > 0) {
    a.fillStyle = HEART_COLOR;
  } else {
    a.fillStyle = HEARTLESS_COLOR;
  }

  a.fill();
  a.beginPath();
  a.arc(980, 390, 25, 0, 2 * Math.PI);
  a.arc(1028, 390, 25, 0, 2 * Math.PI);
  if (spieler.life > 1) {
    a.fillStyle = HEART_COLOR;
  } else {
    a.fillStyle = HEARTLESS_COLOR;
  }
  a.fill();

  a.beginPath();
  a.moveTo(957, 400);
  a.lineTo(1005, 470);
  a.lineTo(1051, 400);
  a.lineTo(1030, 380);
  a.lineWidth = "1";
  a.closePath();
  if (spieler.life > 1) {
    a.fillStyle = HEART_COLOR;
  } else {
    a.fillStyle = HEARTLESS_COLOR;
  }
  a.fill();

  a.fill();
  a.beginPath();
  a.arc(980, 520, 25, 0, 2 * Math.PI);
  a.arc(1028, 520, 25, 0, 2 * Math.PI);
  if (spieler.life > 2) {
    a.fillStyle = HEART_COLOR;
  } else {
    a.fillStyle = HEARTLESS_COLOR;
  }
  a.fill();

  a.beginPath();
  a.moveTo(957, 530);
  a.lineTo(1005, 600);
  a.lineTo(1051, 530);
  a.lineTo(1030, 510);
  a.lineWidth = "1";
  a.closePath();
  if (spieler.life > 2) {
    a.fillStyle = HEART_COLOR;
  } else {
    a.fillStyle = HEARTLESS_COLOR;
  }
  a.fill();
}

/* Zeigt den Schaden */
function showDmgMarker() {
  document.getElementById("wall").style.borderColor = ENEMY_COLOR;

  setTimeout(function () {
    document.getElementById("wall").style.borderColor = BOMB_FUSE_COLOR;
  }, 1500);
}

/* Zeichnet das Tutorial */
function showTutorial() {
  a.beginPath();
  a.rect(0, 0, fieldSize, fieldSize);
  a.fillStyle = NOTHING_COLOR;
  a.fill();

  a.font = "60px Calibri";
  a.fillStyle = WATER_COLOR;
  a.textAlign = "center";
  a.fillText("Tutorial", 550, 110);

  a.font = "30px Calibri";
  a.fillStyle = WATER_COLOR;
  a.textAlign = "center";
  a.fillText("Bomben können mit der Leertaste gelegt werden", 550, 350);
  a.fillText(
    "Mit M werden Bomben gewechselt, um den Wandfarben zu entsprechen",
    550,
    380
  );
  a.fillText("Gegner fügen dir bei Berührung Schaden hinzu", 550, 550);
  a.fillText("Du kannst ihnen durch Bombenexplosionen schaden", 550, 580);
  a.fillText(
    "Manche Gegner haben Rüstung und halten mehr als eine Explosion aus",
    550,
    610
  );
  a.fillText("Sammle Boosts, um neue Effekte auszulösen", 550, 790);
  a.fillText("Mit den Pfeiltasten kannst du zu ihnen laufen", 550, 820);

  a.beginPath();
  a.font = "35px Calibri";
  a.fillStyle = WATER_COLOR;
  a.textAlign = "center";
  a.fillText("Zum Start", 1000, 850);

  a.beginPath();
  a.moveTo(410, 250);
  a.lineTo(470, 170);
  a.lineWidth = 10;
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(400, 230);
  a.lineTo(435, 185);
  a.lineTo(466, 206);
  a.lineTo(410, 280);
  a.lineWidth = "1";
  a.closePath();
  a.fillStyle = WATER_COLOR;
  a.fill();

  a.beginPath();
  a.arc(410, 250, 50, 0, 2 * Math.PI);
  a.fillStyle = WATER_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(540, 250);
  a.lineTo(600, 170);
  a.lineWidth = 10;
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(530, 230);
  a.lineTo(565, 185);
  a.lineTo(596, 206);
  a.lineTo(540, 280);
  a.lineWidth = "1";
  a.closePath();
  a.fillStyle = FIRE_COLOR;
  a.fill();

  a.beginPath();
  a.arc(540, 250, 50, 0, 2 * Math.PI);
  a.fillStyle = FIRE_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(670, 250);
  a.lineTo(730, 170);
  a.lineWidth = 10;
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(660, 230);
  a.lineTo(695, 185);
  a.lineTo(726, 206);
  a.lineTo(670, 280);
  a.lineWidth = "1";
  a.closePath();
  a.fillStyle = GRASS_COLOR;
  a.fill();

  a.beginPath();
  a.arc(670, 250, 50, 0, 2 * Math.PI);
  a.fillStyle = GRASS_COLOR;
  a.fill();

  a.beginPath();
  a.arc(540, 470, 40, 0, 2 * Math.PI);
  a.fillStyle = ENEMY_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(502, 460);
  a.lineTo(510, 410);
  a.lineTo(560, 480);
  a.closePath();
  a.fillStyle = ENEMY_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(530, 460);
  a.lineTo(572, 410);
  a.lineTo(579, 480);
  a.closePath();
  a.fillStyle = ENEMY_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(540, 650);
  a.lineTo(490, 750);
  a.lineTo(590, 750);
  a.closePath();
  a.fillStyle = BOOST_COLOR;
  a.fill();
}

/* Zeichnet den Startbildschirm */
function startUp() {
  a.beginPath();
  a.rect(0, 0, fieldSize, fieldSize);
  a.fillStyle = NOTHING_COLOR;
  a.fill();

  a.beginPath();
  a.font = "60px Calibri";
  a.fillStyle = WATER_COLOR;
  a.textAlign = "center";
  a.fillText("Bomberman", 550, 440);

  a.beginPath();
  a.rect(440, 500, 210, 100);
  a.fillStyle = WATER_COLOR;
  a.fill();
  a.beginPath();
  a.font = "30px Calibri";
  a.fillStyle = WHITE;
  a.textAlign = "center";
  a.fillText("Spiel starten", 545, 560);

  a.beginPath();
  a.font = "35px Calibri";
  a.fillStyle = WATER_COLOR;
  a.textAlign = "center";
  a.fillText("Tutorial", 1000, 850);

  a.beginPath();
  a.moveTo(410, 300);
  a.lineTo(470, 220);
  a.lineWidth = 10;
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(400, 280);
  a.lineTo(435, 235);
  a.lineTo(466, 256);
  a.lineTo(410, 330);
  a.lineWidth = "1";
  a.closePath();
  a.fillStyle = WATER_COLOR;
  a.fill();

  a.beginPath();
  a.arc(410, 300, 50, 0, 2 * Math.PI);
  a.fillStyle = WATER_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(540, 300);
  a.lineTo(600, 220);
  a.lineWidth = 10;
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(530, 280);
  a.lineTo(565, 235);
  a.lineTo(596, 256);
  a.lineTo(540, 330);
  a.lineWidth = "1";
  a.closePath();
  a.fillStyle = FIRE_COLOR;
  a.fill();

  a.beginPath();
  a.arc(540, 300, 50, 0, 2 * Math.PI);
  a.fillStyle = FIRE_COLOR;
  a.fill();

  a.beginPath();
  a.moveTo(670, 300);
  a.lineTo(730, 220);
  a.lineWidth = 10;
  a.strokeStyle = BOMB_FUSE_COLOR;
  a.stroke();

  a.beginPath();
  a.moveTo(660, 280);
  a.lineTo(695, 235);
  a.lineTo(726, 256);
  a.lineTo(670, 330);
  a.lineWidth = "1";
  a.closePath();
  a.fillStyle = GRASS_COLOR;
  a.fill();

  a.beginPath();
  a.arc(670, 300, 50, 0, 2 * Math.PI);
  a.fillStyle = GRASS_COLOR;
  a.fill();
}

/* Zeige Gewinnbildschirm */
function showWin() {
  document.getElementById("wall").style.borderColor = INTERFACE_GREY;
  document.removeEventListener("keydown", clicker);

  a.beginPath();
  a.rect(0, 0, fieldSize, fieldSize);
  a.fillStyle = WIN_COLOR;
  a.fill();

  a.beginPath();
  a.font = "60px Calibri";
  a.fillStyle = NOTHING_COLOR;
  a.textAlign = "center";
  a.fillText("Du hast gewonnen!", 550, 400);

  a.beginPath();
  a.font = "40px Calibri";
  a.fillStyle = NOTHING_COLOR;
  a.textAlign = "center";
  a.fillText("Deine Zeit: " + finalTime, 550, 460);

  a.beginPath();
  a.rect(440, 500, 210, 100);
  a.fillStyle = "#fce5b3";
  a.fill();
  a.beginPath();
  a.font = "35px Calibri";
  a.fillStyle = WIN_COLOR;
  a.textAlign = "center";
  a.fillText("Nochmal", 545, 563);

  elem.addEventListener("click", function (event) {
    if (
      event.x > 440 &&
      event.x < 440 + 210 &&
      event.y > 500 &&
      event.y < 500 + 100
    ) {
      window.location.reload();
    }
  });
}

/* Zeige Lossbildschirm */
function showLoss() {
  document.removeEventListener("keydown", clicker);

  a.beginPath();
  a.rect(0, 0, fieldSize, fieldSize);
  a.fillStyle = LOSS_COLOR;
  a.fill();

  a.beginPath();
  a.font = "60px Calibri";
  a.fillStyle = NOTHING_COLOR;
  a.textAlign = "center";
  a.fillText("Du hast verloren :(", 550, 400);

  a.beginPath();
  a.rect(440, 500, 210, 100);
  a.fillStyle = NOTHING_COLOR;
  a.fill();
  a.beginPath();
  a.font = "35px Calibri";
  a.fillStyle = LOSS_COLOR;
  a.textAlign = "center";
  a.fillText("Nochmal", 545, 562);

  elem.addEventListener("click", function (event) {
    if (
      event.x > 440 &&
      event.x < 440 + 210 &&
      event.y > 500 &&
      event.y < 500 + 100
    ) {
      window.location.reload();
    }
  });
}
