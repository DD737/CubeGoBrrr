
class level
{
    /** @type {room[][]} */
    rooms;
    /** @type {room} */
    croom;

    onRoomChangeHandler = [];

    defaults = {
        crx: 0,
        cry: 0,
        srx: 0,
        sry: 0,
    }

    constructor(roomAmount, tileAmount, crx, cry, srx, sry, player)
    {
        this.rooms = [];
        for(let x = 0; x < roomAmount; x++)
        {
            this.rooms.push([]);
            for(let y = 0; y < roomAmount; y++)
                this.rooms[x].push(new room(x, y, tileAmount));
        }
        this.defaults.crx = crx;
        this.defaults.cry = cry;
        this.defaults.srx = srx;
        this.defaults.sry = sry;
        this.changeRoom(crx, cry);

        if(player)
        {
            player.x = srx;
            player.y = sry;
        }
    }

    gotoDefaultRoom()
    {
        this.changeRoom(this.defaults.crx, this.defaults.cry);
        globalData.pl.x = this.defaults.srx;
        globalData.pl.y = this.defaults.sry;
    }

    changeRoom(rx, ry)
    {
        this.croom = this.rooms[rx][ry];
        this.onRoomChangeHandler.forEach(handler => handler());
    }
}

class room
{
    /** @type {tile[][]} */
    tiles;
    rx;
    ry;
    visited = false;
    constructor(rx, ry, tileAmount)
    {
        this.rx = rx;
        this.ry = ry;
        this.tiles = [];
        for(let x = 0; x < tileAmount; x++)
        {
            this.tiles.push([]);
            for(let y = 0; y < tileAmount; y++)
                this.tiles[x].push(new tile(x, y));
        }
    }
}

class tile
{

    x;
    y;

    unpassable = false;
    interactable = false;
    destroyed = false;
    tileIndex = 0;

    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    oninteract = () => {};

    onwalkon = () => true;
    
}
class t_block extends tile
{

    unpassable = true;
    tileIndex = 1;

    constructor(x, y)
    {
        super(x, y);
    }

}
class t_portal extends tile
{

    portal = {
        rx: 0,
        ry: 0,
        px: 0,
        py: 0
    }

    interactable = true;
    tileIndex = 2;

    constructor(x, y, rx, ry, px, py)
    {
        super(x, y);
        
        this.portal.rx = rx;
        this.portal.ry = ry;
        this.portal.px = px;
        this.portal.py = py;
    }
    oninteract = () => {
        globalData.clevel.changeRoom(this.portal.rx, this.portal.ry);
        globalData.pl.x = this.portal.px;
        globalData.pl.y = this.portal.py;
        drawInit();
    }

}
class t_key extends tile
{

    interactable = true;
    tileIndex = 3;
    id = -1;

    constructor(x, y, id = -1)
    {
        super(x, y);
        this.id = id;
    }
    onwalkon = () =>
    {

        this.destroyed = true;
        globalData.pl.keys.push(this.id);

        tilesToUpdate.push(this);
        drawUpdates();

        return true;

    }

}
class t_lock extends tile
{

    id = 0;
    tileIndex = 4;

    constructor(x, y, id)
    {
        super(x, y);
        this.id = id;
    }

    onwalkon = () =>
    {

        if(this.destroyed)
            return true;

        let i = globalData.pl.keys.indexOf(this.id);
        if(i > -1)
        {
            globalData.pl.keys[i] = -1;
            this.destroyed = true;
            tilesToUpdate.push(this);
            drawUpdates();
        }

        return false;

    }

}

class tileColor
{
    /** @type {string} */
    tile;
    /** @type {string} */
    border;
    constructor(tile, border)
    {
        this.tile = tile;
        this.border = border;
    }
}



class player
{
    x;
    y;
    draw = false;
    keys = [];
    constructor()
    {
        this.x = 0;
        this.y = 0;
    }
}

class renderer
{

    /** @type {CanvasRenderingContext2D} */
    ctx;
    tileSize;
    borderSize;
    constructor(ctx, tileSize, borderSize)
    {   
        this.ctx = ctx;
        this.tileSize = tileSize;
        this.borderSize = borderSize;
    }

    drawTile(x, y, color)
    {
        let c = this.ctx;

        x = x * (this.tileSize + this.borderSize);
        y = y * (this.tileSize + this.borderSize);

        c.fillStyle = color.border;
        c.fillRect(x, y, this.borderSize, this.tileSize + this.borderSize);
        c.fillRect(x, y, this.tileSize + this.borderSize, this.borderSize);

        c.fillStyle = color.tile;
        c.fillRect(x + this.borderSize, y + this.borderSize, this.tileSize, this.tileSize);
    }

    drawOutline(x, y, t, color)
    {
        
        let c = this.ctx;

        x = x * (this.tileSize + this.borderSize);
        y = y * (this.tileSize + this.borderSize);

        c.fillStyle = color.tile;
        c.fillRect(x + this.borderSize + this.tileSize - t, y,t, this.tileSize + this.borderSize);
        c.fillRect(x, y + this.borderSize + this.tileSize - t, this.tileSize + this.borderSize, t);

        c.fillStyle = color.border;
        c.fillRect(x, y, t, this.tileSize + this.borderSize);
        c.fillRect(x, y, this.tileSize + this.borderSize, t);

    }
    drawOutlineCorner(x, y, t, l, color)
    {
        
        let c = this.ctx;

        x = x * (this.tileSize + this.borderSize);
        y = y * (this.tileSize + this.borderSize);

        c.fillStyle = color.tile;
        c.fillRect(x + this.tileSize + this.borderSize - t, y, t, l);
        c.fillRect(x, y + this.tileSize + this.borderSize - t, l, t);

        c.fillRect(x + this.tileSize + this.borderSize - t, y + this.tileSize + this.borderSize - l, t, l);
        c.fillRect(x + this.tileSize + this.borderSize - l, y + this.tileSize + this.borderSize - t, l, t);

        c.fillStyle = color.border;
        c.fillRect(x, y, l, t);
        c.fillRect(x, y, t, l);

        c.fillRect(x + this.tileSize + this.borderSize - l, y, l, t);
        c.fillRect(x, y + this.tileSize + this.borderSize - l, t, l);

    }

    drawText(x, y, text, fontsize = 18, color = '#ffffff')
    {

        x = x * (this.tileSize + this.borderSize) + (this.tileSize + this.borderSize) / 2;
        y = y * (this.tileSize + this.borderSize) + (this.tileSize + this.borderSize) / 2;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = color;
        this.ctx.font = fontsize + 'px "Press Start 2P"'
        this.ctx.fillText(text, x, y);

    }

}

const playerColor = new tileColor('#9f0000', '#6f0000');
const tileTypes = [
    'air', 
    'block', 
    'portal',
    'key',
    'lock',
];
const tileColors = [
    new tileColor('#123773', '#0b234a'),
    new tileColor('#2d6b23', '#234f23'),
    new tileColor('#20adba', '#155359'),
    new tileColor('#a9b51f', '#697013'),
    new tileColor('#7a7a76', '#4a4a47'),
];

function clientIsOnline() 
{
    return navigator.onLine;
}

class converter
{

    /**
     * @type {Object}
     * @param {level} lev 
     */
    static zipLevel(lev)
    {
        let obj = {
            r: [],
            d: {
                x: lev.defaults.crx,
                y: lev.defaults.cry,
                rx: lev.defaults.srx,
                ry: lev.defaults.sry
            },
        };
        lev.rooms.forEach((row, i) => {
            obj.r.push([]);
            row.forEach(rm => {
                obj.r[i].push(this.zipInternal.zroom(rm));
            });
        });
        return obj;
    }
    static zipInternal = {
        /** @param {room} rm */
        zroom: (rm) => {
            let obj = {
                t: [],
                x: rm.rx,
                y: rm.ry,
                v: rm.visited ? 1 : 0
            }
            rm.tiles.forEach((row, i) => {
                obj.t.push([]);
                row.forEach(tl => {
                    obj.t[i].push(converter.zipInternal.ztile(tl));
                });
            });
            return obj;
        },
        /** @param {tile} tl */
        ztile: (tl) => {
            let t = {
                x: tl.x,
                y: tl.y,
                u: tl.unpassable ? 1 : 0,
                i: tl.interactable ? 1 : 0,
                t: tl.tileIndex,
            };
            if(tl.tileIndex === 2)
            {
                t = Object.assign(t, {
                    p: {
                        x: tl.portal.rx,
                        y: tl.portal.ry,
                        px: tl.portal.px,
                        py: tl.portal.py,
                    }
                });
            }
            else if(tl.tileIndex === 3 || tl.tileIndex === 4)
                t.d = tl.id;
            return t;
        }
    }

    static extractLevel(lev, roomAmount, tileAmount)
    {
        let l = new level(roomAmount, tileAmount, lev.d.x, lev.d.y, lev.d.rx, lev.d.ry);
        l.rooms = [];
        lev.r.forEach((row, i) => {
            l.rooms.push([]);
            row.forEach(rm => {
                l.rooms[i].push(this.extractInternal.eroom(rm));
            });
        });
        return l;
    }
    static extractInternal = {
        eroom: (rm) => {
            let r = new room(rm.x, rm.y);
            r.visited = !!rm.v;
            r.tiles = [];
            rm.t.forEach((row, i) => {
                r.tiles.push([]);
                row.forEach(t => {
                    r.tiles[i].push(converter.extractInternal.etile(t));
                });
            });
            return r;
        },
        etile: (tl) => {
            let t = new tile(tl.x, tl.y);

            if(tl.t === 2)
                t = new t_portal(tl.x, tl.y, tl.p.x, tl.p.y, tl.p.px, tl.p.py);
            else if(tl.t === 3)
                t = new t_key(tl.x, tl.y, tl.d);
            else if(tl.t === 4)
                t = new t_lock(tl.x, tl.y, tl.d);

            t.unpassable = !!tl.u;
            t.interactable = !!tl.i;
            t.tileIndex = tl.t;
            return t;
        }
    }

}
