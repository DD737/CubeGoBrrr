
/** @type {HTMLCanvasElement} */
const cv = document.getElementById("cv");
const ctx = cv.getContext('2d');

const dimensions = 550;

const border = 5, tileAmount = 9, roomAmount = 5;
const tileSize = dimensions / tileAmount - border;

globalData.pl = new player();
globalData.clevel = new level(roomAmount, tileAmount, 2, 2, 4, 4, globalData.pl);
globalData.onLevelChangeHandler.forEach(handler => handler());

const ren = new renderer(ctx, tileSize, border);

/** @type {tile[]} */
let tilesToUpdate = [];

function drawUpdates()
{

    while(tilesToUpdate.length > 0)
    {
        const tile = tilesToUpdate.pop();
        if(tile.destroyed)
            ren.drawTile(tile.x, tile.y, tileColors[0]);
        else
        {
            ren.drawTile(tile.x, tile.y, tileColors[tile.tileIndex]);
            if(tile.tileIndex === 3 || tile.tileIndex === 4)
                ren.drawText(tile.x, tile.y, tile.id + '');
        }
    }

    ren.drawTile(globalData.pl.x, globalData.pl.y, playerColor);
    globalData.pl.draw = false;

}
function drawInit()
{
    globalData.clevel.croom.tiles.forEach(row => {
        row.forEach(tile => {
            tilesToUpdate.push(tile);
        })
    });
    globalData.pl.draw = true;
    drawUpdates();
}
drawInit()
globalData.onLevelChangeHandler.push(() => {
    globalData.clevel.onRoomChangeHandler.push(drawInit);
})

document.addEventListener('keyup', (keyev) => {
    const move = (x, y) => {

        if(globalData.pl.x + x < 0 || globalData.pl.x + x >= tileAmount)
            return;
        if(globalData.pl.y + y < 0 || globalData.pl.y + y >= tileAmount)
            return;

        if(globalData.clevel.croom.tiles[globalData.pl.x + x][globalData.pl.y + y].unpassable)
            return;

        if(!globalData.clevel.croom.tiles[globalData.pl.x + x][globalData.pl.y + y].destroyed)
            if(!globalData.clevel.croom.tiles[globalData.pl.x + x][globalData.pl.y + y].onwalkon())
                return;

        tilesToUpdate.push(globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y]);

        globalData.pl.x += x;
        globalData.pl.y += y;
        globalData.pl.draw = true;

        tilesToUpdate.push(globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y]);

    }

    let key = keyev.key;
    switch(key)
    {
        case 'e':
        case ' ':
            let currentTile = globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y];
            if(currentTile.interactable && !currentTile.destroyed)
                currentTile.oninteract();
            break;

        case 'w':
        case 'ArrowUp':
            move(0, -1);
            break;
        
        case 's':
        case 'ArrowDown':
            move(0, 1);
            break;

        case 'a':
        case 'ArrowLeft':
            move(-1, 0);
            break;

        case 'd':
        case 'ArrowRight':
            move(1, 0);
            break;
    }

    drawUpdates();

    let nkeys = [];
    globalData.pl.keys.forEach(key => {
        if(key > -1)
            nkeys.push(key);
    });
    globalData.pl.keys = nkeys;

    updateKeyDisplay();

});

function save(filename, data) 
{
    const blob = new Blob([ data ], { type: 'text/csv' });
    if(window.navigator.msSaveOrOpenBlob) 
        window.navigator.msSaveBlob(blob, filename);
    else
    {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}
function saveLevel(silent = false)
{
    try 
    {
        save('level.cgb', JSON.stringify(converter.zipLevel(globalData.clevel)));
        return true;
    } 
    catch (error) 
    {
        if(!silent)
            alert('Something went wrong while saving the level, we are very sorry :(');
            return false;
    }
}
function loadLevel(lvstr)
{
    try 
    {
        let obj = JSON.parse(lvstr);
        let lv = converter.extractLevel(obj, roomAmount, tileAmount);
        globalData.clevel = lv;
        globalData.clevel.gotoDefaultRoom();
        drawInit();
        globalData.onLevelChangeHandler.forEach(handler => handler());
    } 
    catch (error) 
    {
        alert('File corrupt or unsupported!');
    }
}

function updateKeyDisplay()
{

    const keys = document.getElementById('keys');

    keys.innerHTML = 'KEYS:&nbsp;'

    if(globalData.pl.keys.length === 0)
        keys.innerHTML += '[NONE]';
    else
    {
        let text = '' + globalData.pl.keys[0];
        for(let i = 1; i < globalData.pl.keys.length; i++)
            text += ', ' + globalData.pl.keys[i];
        keys.innerHTML += text;
    }

}
updateKeyDisplay();
