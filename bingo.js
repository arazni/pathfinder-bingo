const selectGod = document.getElementById("god-selection");
const buttonGenerateBingo = document.getElementById("generate-bingo");
const buttonDownloadBingo = document.getElementById("download-bingo");
const canvasBingoElement = document.getElementById("canvas-bingo");
const buttonCopyImageDescription = document.getElementById("copy-description");
const canvasBingo = canvasBingoElement.getContext("2d");
const canvasOriginal = document.getElementById("canvas-original").getContext("2d", { willReadFrequently: true });
const imageName = "Prophecy.png";
const arazniIcon = "Arazni.png";
const allGods = ["Abadar","Asmodeus","Calistria","Cayden","Desna","Erastil","Gorum","Gozreh","Iomedae","Irori","Lamashtu","Nethys","Norgorber","Pharasma","Rovagug","Sarenrae","Shelyn","Torag","Urgathoa","Zon-Kuthon"];
const originalTileGods = ["Erastil", "Iomedae", "Torag", "Sarenrae", "Shelyn", "Cayden", "Desna", "Abadar", "Irori", "Gozreh", "Nethys", "Pharasma", "Calistria", "Gorum", "Asmodeus", "Zon-Kuthon", "Norgorber", "Urgathoa", "Lamashtu", "Rovagug"];
const safeGods = ["Pharasma", "Asmodeus", "Cayden", "Urgathoa", "Erastil", "Nethys", "Zon-Kuthon"];
const rawWidth = 1301;
const rawHeight = 2001;
const borderColor = "#ED453A";
const fillColor = "#562857";
const borderWidth = 24;
const fillWidth = 20;
const tileDimensions = {
  firstTileX: 35,
  firstTileY: 366,
  tileWidth: 281, //315 - 35 + jpg suffering 1,
  tileHeight: 291, //656 - 366 + jpg suffering 1,
  nextTileDx: 317.33, //(987 - 35)/3,
  nextTileDy: 327.25 //(1675 - 366)/4
}
// const strongGenerateBingoError = document.getElementById("generate-bingo-error");

// firefox seems to need this function
function reset() {
  selectGod.value = "";
  selectGod.disabled = false;
  buttonGenerateBingo.disabled = true;
  buttonDownloadBingo.disabled = true;
  buttonCopyImageDescription.disabled = true;
}

function cleanup() {
  selectGod.disabled = true;
  buttonGenerateBingo.disabled = true;
  buttonDownloadBingo.disabled = false;
  buttonCopyImageDescription.disabled = false;
  canvasBingoElement.classList.remove("dn");
}

reset();

function randomizeGods(gods) {
  return gods.map(god => [Math.random(), god]).sort().map(([_, god]) => god);
}

function godsToTiles(gods, originalTileOrder) {
  return gods.map((god, index) => {
    const tile = originalTileOrder.indexOf(god);
    const x = tile % 4;
    const y = Math.floor(tile / 4);

    return {
      originalGod: god,
      tileIndex: tile,
      newTileIndex: index,
      leftPixel: Math.round(tileDimensions.firstTileX + x * tileDimensions.nextTileDx),
      topPixel: Math.round(tileDimensions.firstTileY + y * tileDimensions.nextTileDy)
    };
  });
}

function generateAltText(gods, pickedGod, safeGods, stamp) {
  return `A bingo card comprised of 5 rows and 4 columns.` 
  + ` The first row is at the top and the gods are described left to right.`
  + ` The first row has ${gods[0]}, ${gods[1]}, ${gods[2]}, and ${gods[3]}.`
  + ` The second row has ${gods[4]}, ${gods[5]}, ${gods[6]}, and ${gods[7]}.`
  + ` The third row has ${gods[8]}, ${gods[9]}, ${gods[10]}, and ${gods[11]}.`
  + ` The fourth row has ${gods[12]}, ${gods[13]}, ${gods[14]}, and ${gods[15]}.`
  + ` The final row has ${gods[16]}, ${gods[17]}, ${gods[18]}, and ${gods[19]}.`
  + ` ${safeGods[0]}, ${safeGods[1]}, ${safeGods[2]}, ${safeGods[3]}, ${safeGods[4]}, ${safeGods[5]}, and ${safeGods[6]} are already marked safe with a circle.`
  + ` ${pickedGod} is marked with an X as the god you think will die.`
  + ` It is dated ${stamp}.`;
}

function shuffleImage(gods, godTiles) {
  gods.forEach((god, godIndex) => {
    const originalTileData = godTiles.find((tile) => tile.originalGod === god);
    const newTileData = godTiles.find((tile) => tile.tileIndex === godIndex);
    const tileImage = canvasOriginal.getImageData(originalTileData.leftPixel, originalTileData.topPixel, tileDimensions.tileWidth, tileDimensions.tileHeight);
    canvasBingo.putImageData(tileImage, newTileData.leftPixel, newTileData.topPixel);
  });
}

function markForDeath(gods, godTiles, pickedGod) {
  const pickedIndex = gods.indexOf(pickedGod);
  const godTile = godTiles.find(tile => tile.tileIndex === pickedIndex);

  const x1 = godTile.leftPixel + 20;
  const y1 = godTile.topPixel + 25;
  const x2 = godTile.leftPixel + tileDimensions.tileWidth - 20;
  const y2 = godTile.topPixel + tileDimensions.tileHeight - 25;

  canvasBingo.beginPath();

  canvasBingo.lineWidth = borderWidth;
  canvasBingo.strokeStyle = borderColor;
  
  canvasBingo.moveTo(x1, y1);
  canvasBingo.lineTo(x2, y2);
  canvasBingo.moveTo(x2, y1);
  canvasBingo.lineTo(x1, y2);

  canvasBingo.stroke();

  canvasBingo.lineWidth = fillWidth;
  canvasBingo.strokeStyle = fillColor;

  canvasBingo.stroke();
}

function markSafe(gods, godTiles, safeGods) {
  // canvasBingo.textAlign = "center";
  // canvasBingo.textBaseline = "middle";
  // canvasBingo.font = "bold 48px calibri";

  safeGods.forEach(safeGod => {
    safeIndex = gods.indexOf(safeGod);
    const godTile = godTiles.find(tile => tile.tileIndex === safeIndex);

    const x = Math.round(godTile.leftPixel + tileDimensions.tileWidth / 2);
    const y = Math.round(godTile.topPixel + tileDimensions.tileHeight / 2);
    
    canvasBingo.beginPath();

    canvasBingo.lineWidth = borderWidth;
    canvasBingo.strokeStyle = borderColor; //"#f4bbff";
    canvasBingo.arc(x, y, 120, 0, 2 * Math.PI);
    canvasBingo.stroke();

    canvasBingo.lineWidth = fillWidth;
    canvasBingo.strokeStyle = fillColor; //"#9932CC";
    canvasBingo.stroke();

    // canvasBingo.lineWidth = 2;
    // canvasBingo.strokeStyle = "black";
    // canvasBingo.strokeText("Safe!", x, y + 50);
  });
}

function markTime(stamp) {
  canvasBingo.textBaseline = "top";
  canvasBingo.textAlign = "left";
  canvasBingo.lineWidth = 1;
  canvasBingo.font = "20px calibri";
  canvasBingo.strokeStyle = "black";
  canvasBingo.strokeText(stamp, 5, 5);
}

// Doesn't seem to download any image description with it
function downloadBingo() {
  let dataUrl = canvasBingoElement.toDataURL("image/png");
  let a = document.createElement("a");
  a.href = dataUrl;
  a.download = "godsrain-bingo.png";
  a.title = canvasBingoElement.title;
  a.click();
  a.remove();
}

function drawImage(gods, pickedGod, safeGods) {
  const godTiles = godsToTiles(gods, originalTileGods);
  shuffleImage(gods, godTiles);
  markForDeath(gods, godTiles, pickedGod);
  markSafe(gods, godTiles, safeGods);
  const stamp = new Date().toUTCString();
  markTime(stamp);
  canvasBingoElement.title = generateAltText(gods, pickedGod, safeGods, stamp);
}

function setupCanvas(gods, pickedGod, safeGods) {
  const original = new Image();
  original.addEventListener("load", () => {
    canvasOriginal.drawImage(original, 0, 0);
    canvasBingo.drawImage(original, 0, 0);
    drawImage(gods, pickedGod, safeGods);
    cleanup();
    // downloadBingo();
  }, false);
  original.src = imageName;
  original.alt = generateAltText(gods, pickedGod, safeGods);
}

selectGod.addEventListener("change", () => {
  const god = selectGod.value;
  if (god) {
    buttonGenerateBingo.disabled = false;
  }
  else {
    buttonGenerateBingo.disabled = true;
  }
})

buttonGenerateBingo.addEventListener("click", () => {
  const pickedGod = selectGod.value;
  if (!pickedGod) {
    return;
  }
  
  setupCanvas(randomizeGods(allGods), pickedGod, safeGods);
});

buttonDownloadBingo.addEventListener("click", () => downloadBingo());

// https://www.freecodecamp.org/news/copy-text-to-clipboard-javascript/
async function copyImageDescription() {
  try {
    const description = canvasBingoElement.title;
    await navigator.clipboard.writeText(description);
    document.getElementById("copied-success").classList.remove("dn");
  } catch (err) {
    alert('Failed to copy: ', err);
  }
}

buttonCopyImageDescription.addEventListener("click", () => copyImageDescription());