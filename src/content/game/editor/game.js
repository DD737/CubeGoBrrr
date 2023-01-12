
let menuMode = false, portalSelectMode = 0, startPosSelectMode = 0;
let blockMenuModeInput = false;

/** @type {tile | t_portal} */
let editedTile;

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
            else if(tile.tileIndex === 2)
            {
                ren.drawText(tile.x - .15, tile.y - .2, tile.portal.rx + '', 13, '#00ff00');
                ren.drawText(tile.x + .2, tile.y - .2, tile.portal.ry + '', 13, '#00ff00');
                ren.drawText(tile.x - .15, tile.y + .16, tile.portal.px + '', 13, '#ff5050');
                ren.drawText(tile.x + .2, tile.y + .16, tile.portal.py + '', 13, '#ff5050');
            }
        }
    }

    ren.drawOutline(globalData.pl.x, globalData.pl.y, 5, playerColor);
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

const menuWindow = document.getElementById('menuWindow');

/** @type {HTMLCanvasElement} */
const menuCV = document.getElementById('menuCV');
const mtx = menuCV.getContext('2d');
const mren = new renderer(mtx, tileSize, border);

let highlighted = 0;

class menuRect
{
    
    /** @type {tileColor} */
    color;
    text;

    x;
    y;
    tx;
    ty;
    rx;
    ry;
    rtx;
    rty;
    tsize;

}

let menuHadSelectedWithMouse = false;

function menuCalcRects()
{

    let rects = [];

    const menuDimensions = 525;

    let space = 10;

    let perrow = (menuDimensions - space) / (tileSize + border + space);

    perrow = Math.floor(perrow);

    space = (menuDimensions - perrow * (tileSize + border)) / (perrow + 1);

    const rspace = space / (tileSize + border);

    let y = rspace;
    let ry = space;
    for(let i = 0; i < tileColors.length; i++)
    {

        let x = rspace + i * (1 + rspace);
        let rx = rspace + i * (tileSize + border + space);
        //mren.drawTile(x, y, tileColors[i]);
        //mren.drawText(x + 0.045, y, tileTypes[i], 9);

        let rect = new menuRect();

        rect.x = x;
        rect.y = y;
        rect.tx = x + .045;
        rect.ty = y;

        rect.rx = rx;
        rect.ry = ry;
        rect.rtx = rx + .045 * (tileSize + border);
        rect.rty = ry;

        rect.color = tileColors[i];
        rect.text = tileTypes[i];
        rect.tsize = 9;

        rects.push(rect);

        //if(i === highlighted)
        //    mren.drawOutline(x, y, border, playerColor);

        if(i !== 0 && i % perrow === 0)
        {
            y += 1 + rspace;
            ry += tileSize + border +   space;
        }

    }

    return rects;

}

menuCV.addEventListener('mousemove', ev => {

    if(!menuMode)
        return;

    const r = menuCV.getBoundingClientRect();
    const x = ev.pageX - r.x;
    const y = ev.pageY - r.y;

    const rects = menuCalcRects();

    for(let i = 0; i < rects.length; i++)
    {

        const r = rects[i];

        if(x >= r.rx && x <= r.rx + tileSize + border)
            if(y >= r.ry && y <= r.ry + tileSize + border)
            {
                highlighted = i;
                menuHadSelectedWithMouse = true;
                drawMenu();
                return;
            }

    }

    if(menuHadSelectedWithMouse)
    {
        highlighted = -1;
        drawMenu();
    }

});

menuCV.addEventListener('mouseup', ev => {
    
    if(!menuMode)
        return;

    const r = menuCV.getBoundingClientRect();
    const x = ev.pageX - r.x;
    const y = ev.pageY - r.y;

    const rects = menuCalcRects();

    for(let i = 0; i < rects.length; i++)
    {

        const r = rects[i];

        if(x >= r.rx && x <= r.rx + tileSize + border)
            if(y >= r.ry && y <= r.ry + tileSize + border)
            {
                highlighted = i;
                drawMenu();
                documentKeyUpListener({ key: 'e' });
                menuHadSelectedWithMouse = true;
                return;
            }

    }

    if(menuHadSelectedWithMouse)
    {
        highlighted = -1;
        drawMenu();
    }

});

function drawMenu()
{

    const rects = menuCalcRects();

    for(let i = 0; i < rects.length; i++)
    {

        const rect = rects[i];
        
        mren.drawTile(rect.x, rect.y, rect.color);
        mren.drawText(rect.tx, rect.ty, rect.text, rect.tsize);

        if(highlighted === i)
            mren.drawOutline(rect.x, rect.y, border, playerColor);

    }

}

const documentKeyUpListener = (keyev) => {
    const move = (x, y) => {

        if(globalData.pl.x + x < 0 || globalData.pl.x + x >= tileAmount)
            return;
        if(globalData.pl.y + y < 0 || globalData.pl.y + y >= tileAmount)
            return;

        //if(globalData.clevel.croom.tiles[globalData.pl.x + x][globalData.pl.y + y].unpassable)
        //    return;

        tilesToUpdate.push(globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y]);

        globalData.pl.x += x;
        globalData.pl.y += y;
        globalData.pl.draw = true;

        tilesToUpdate.push(globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y]);

    }

    let key = keyev.key;
    if(portalSelectMode > 0)
    {
        if(key === 'Escape')
        {
            portalSelectMode = 0;
            document.getElementById('portalSelectWindow').classList.add('hidden');
            document.getElementById('portalSelectWindow_title1').classList.add('hidden');
            document.getElementById('portalSelectWindow_title2').classList.add('hidden');
        }
    }
    else if(startPosSelectMode > 0)
    {
        if(key === 'Escape')
        {
            startPosSelectMode = 0;
            document.getElementById('startPosSelectWindow').classList.add('hidden');
            document.getElementById('startPosSelectWindow_title1').classList.add('hidden');
            document.getElementById('startPosSelectWindow_title2').classList.add('hidden');
        }
    }
    else if(menuMode)
    {
        if(!blockMenuModeInput)
            switch(key)
            {
                case 'e':
                case ' ':
                    {
                        let keepMenu = false;

                        let ntile;
                        let x = globalData.pl.x;
                        let y = globalData.pl.y;
                        switch(highlighted)
                        {
                            case 0:
                                ntile = new tile(x, y);
                                break;
                            case 1:
                                ntile = new t_block(x, y);
                                break;
                            case 2:
                                ntile = false;
                                editedTile = new t_portal(x, y, 0, 0, 0, 0);
                                portalSelectMode = 1;
                                document.getElementById('portalSelectWindow').classList.remove('hidden');
                                document.getElementById('portalSelectWindow_title1').classList.remove('hidden');
                                break;
                            case 3:
                                ntile = false;
                                {
                                    const keyDisplay = document.getElementById('idSelectWindow_title_key');
                                    keyDisplay.classList.remove('hidden');

                                    let id = 0;
                                    const idDisplay = document.getElementById('idSelectWindow_id')
                                    idDisplay.innerHTML = id;

                                    const idWindow = document.getElementById('idSelectWindow');
                                    idWindow.classList.remove('hidden');

                                    const onup = () => {
                                        id++;
                                        idDisplay.innerHTML = id;
                                    }
                                    const ondown = () => {
                                        if(id !== 0)
                                            id--;
                                        idDisplay.innerHTML = id;
                                    }
                                    const onselect = () => {
                                        idWindow.classList.add('hidden');
                                        keyDisplay.classList.add('hidden');
                                        globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y] = new t_key(x, y, id);
                                        document.getElementById('idSelectWindow_up').onclick = () => {};
                                        document.getElementById('idSelectWindow_down').onclick = () => {};
                                        document.getElementById('idSelectWindow_select').onclick = () => {};
                                        document.removeEventListener('keyup', onkey);
                                        drawInit();
                                        menuMode = false;
                                        blockMenuModeInput = false;
                                    }
                                    const onkey = (keyev) => {
                                        switch(keyev.key)
                                        {
                                            case 'Escape':
                                                idWindow.classList.add('hidden');
                                                keyDisplay.classList.add('hidden');
                                                document.getElementById('idSelectWindow_up').onclick = () => {};
                                                document.getElementById('idSelectWindow_down').onclick = () => {};
                                                document.getElementById('idSelectWindow_select').onclick = () => {};
                                                document.removeEventListener('keyup', onkey);
                                                menuMode = false;
                                                blockMenuModeInput = false;
                                                break;
                                            case 'ArrowUp':
                                            case 'w':
                                                onup();
                                                break;
                                            case 'ArrowDown':
                                            case 's':
                                                ondown();
                                                break;
                                            case 'e':
                                            case ' ':
                                            case 'Enter':
                                                onselect();
                                                break;
                                        }
                                    }
                                    document.getElementById('idSelectWindow_up').onclick = onup;
                                    document.getElementById('idSelectWindow_down').onclick = ondown;
                                    document.getElementById('idSelectWindow_select').onclick = onselect;
                                    document.addEventListener('keyup', onkey);
                                    keepMenu = true;
                                    blockMenuModeInput = true;
                                }
                                break;
                            case 4:
                                ntile = false;
                                {
                                    const lockDisplay = document.getElementById('idSelectWindow_title_lock');
                                    lockDisplay.classList.remove('hidden');

                                    let id = 0;
                                    const idDisplay = document.getElementById('idSelectWindow_id')
                                    idDisplay.innerHTML = id;

                                    const idWindow = document.getElementById('idSelectWindow');
                                    idWindow.classList.remove('hidden');

                                    const onup = () => {
                                        id++;
                                        idDisplay.innerHTML = id;
                                    }
                                    const ondown = () => {
                                        if(id !== 0)
                                            id--;
                                        idDisplay.innerHTML = id;
                                    }
                                    const onselect = () => {
                                        idWindow.classList.add('hidden');
                                        lockDisplay.classList.add('hidden');
                                        globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y] = new t_lock(x, y, id);
                                        document.getElementById('idSelectWindow_up').onclick = () => {};
                                        document.getElementById('idSelectWindow_down').onclick = () => {};
                                        document.getElementById('idSelectWindow_select').onclick = () => {};
                                        document.removeEventListener('keyup', onkey);
                                        drawInit();
                                        menuMode = false;
                                        blockMenuModeInput = false;
                                    }
                                    const onkey = (keyev) => {
                                        switch(keyev.key)
                                        {
                                            case 'Escape':
                                                idWindow.classList.add('hidden');
                                                lockDisplay.classList.add('hidden');
                                                document.getElementById('idSelectWindow_up').onclick = () => {};
                                                document.getElementById('idSelectWindow_down').onclick = () => {};
                                                document.getElementById('idSelectWindow_select').onclick = () => {};
                                                document.removeEventListener('keyup', onkey);
                                                menuMode = false;
                                                blockMenuModeInput = false;
                                                break;
                                            case 'ArrowUp':
                                            case 'w':
                                                onup();
                                                break;
                                            case 'ArrowDown':
                                            case 's':
                                                ondown();
                                                break;
                                            case 'e':
                                            case ' ':
                                            case 'Enter':
                                                onselect();
                                                break;
                                        }
                                    }
                                    document.getElementById('idSelectWindow_up').onclick = onup;
                                    document.getElementById('idSelectWindow_down').onclick = ondown;
                                    document.getElementById('idSelectWindow_select').onclick = onselect;
                                    document.addEventListener('keyup', onkey);
                                    keepMenu = true;
                                    blockMenuModeInput = true;
                                }
                                break;
                        }
                        if(ntile)
                        {
                            globalData.clevel.croom.tiles[x][y] = ntile;
                            tilesToUpdate.push(ntile);
                            globalData.pl.draw = true;
                            drawUpdates();
                        }

                        menuMode = keepMenu;
                        menuWindow.classList.add('hidden');
                    }
                    break;
                case 'Escape':
                    menuMode = false;
                    menuWindow.classList.add('hidden');
                    break;

                case 'w':
                case 'ArrowUp':
                case 'a':
                case 'ArrowLeft':
                    if(highlighted < 0)
                    {
                        highlighted = 0;
                        menuHadSelectedWithMouse = false;
                        break;
                    }
                    highlighted--;
                    if(highlighted <= -1)
                        highlighted = tileColors.length - 1;
                    break;
            
                case 's':
                case 'ArrowDown':
                case 'd':
                case 'ArrowRight':
                    if(highlighted < 0)
                    {
                        highlighted = 0;
                        menuHadSelectedWithMouse = false;
                        break;
                    }
                    highlighted ++;
                    if(highlighted >= tileColors.length)
                        highlighted = 0;
                    break;
            }
        drawMenu();
    }
    else
    {

        switch(key)
        {
            case 'Enter':
                debug();
                break;
            case 'e':
            case ' ':
                menuMode = true;
                menuWindow.classList.remove('hidden');
                drawMenu();
                break;

            case 'f':
                {
                    let currTile = globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y];
                    if(currTile.tileIndex === 2)
                        currTile.oninteract();
                }
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

    }
}

document.addEventListener('keyup', documentKeyUpListener);

cv.addEventListener('mouseleave', () => {

    if(portalSelectMode !== 2 && startPosSelectMode !== 2)  
        return;

    drawInit();

})

cv.addEventListener('mousemove', ev => {

    if(portalSelectMode !== 2 && startPosSelectMode !== 2)  
        return;

    const r = cv.getBoundingClientRect();
    const x = ev.pageX - r.x;
    const y = ev.pageY - r.y;

    const fullTileSize = tileSize + border;

    for(let cx = 0; cx < tileAmount; cx++)
        for(let cy = 0; cy < tileAmount; cy++)
        {
            if(x >= cx * fullTileSize && x < cx * fullTileSize + fullTileSize)
                if(y >= cy * fullTileSize && y < cy * fullTileSize + fullTileSize)
                {
                    drawInit();
                    ren.drawOutlineCorner(cx, cy, 8, fullTileSize / 3, playerColor);
                    return;
                }
        }

});

cv.addEventListener('mouseup', ev => {

    if(portalSelectMode !== 2 && startPosSelectMode !== 2)  
        return;

    const r = cv.getBoundingClientRect();
    const x = ev.pageX - r.x;
    const y = ev.pageY - r.y;

    const fullTileSize = tileSize + border;

    for(let cx = 0; cx < tileAmount; cx++)
        for(let cy = 0; cy < tileAmount; cy++)
            if(x >= cx * fullTileSize && x < cx * fullTileSize + fullTileSize)
                if(y >= cy * fullTileSize && y < cy * fullTileSize + fullTileSize)
                {
                    if(portalSelectMode === 2)
                    {
                        drawInit();
                        ren.drawOutlineCorner(cx, cy, 8, fullTileSize / 3, playerColor);
                        if(editedTile)
                        {
                            editedTile.portal.px = cx;
                            editedTile.portal.py = cy;
                        }
                        portalSelectMode = 0;
                        menuMode = false;
                        menuWindow.classList.add('hidden');
                        document.getElementById('portalSelectWindow_title2').classList.add('hidden');
                        document.getElementById('portalSelectWindow').classList.add('hidden');
                        globalData.clevel.croom.tiles[globalData.pl.x][globalData.pl.y] = editedTile;
                        editedTile = undefined;
                        drawInit();
                        return;
                    }
                    else if(startPosSelectMode === 2)
                    {
                        drawInit();
                        globalData.clevel.defaults.srx = cx;
                        globalData.clevel.defaults.sry = cy;
                        startPosSelectMode = 0;
                        menuMode = false;
                        menuWindow.classList.add('hidden');
                        document.getElementById('startPosSelectWindow_title2').classList.add('hidden');
                        document.getElementById('startPosSelectWindow').classList.add('hidden');
                    }
                }

})

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

function debug()
{
    
}
