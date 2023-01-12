
let globalData = {
    /** @type {level} */
    clevel: undefined,
    /** @type {player} */
    pl: undefined,
    onLevelChangeHandler: [],
}

{

    const dimensions = 160;
    const space = 5;

    /** @type {HTMLCanvasElement} */
    const mcv = document.getElementById('mcv');
    const ctx = mcv.getContext('2d');

    const colors = {
        player: '#2d6b23',
        visited: '#123773',
        else: '#262c36',
    }

    let rooms = [];

    function onlevelchange()
    {

        function onroomchange()
        {
            rooms = [];

            globalData.clevel.rooms.forEach((row, i) => {
                rooms.push([]);
                row.forEach(room => {
                    rooms[i].push(room.visited ? 1 : 0);
                })
            })

            rooms[globalData.clevel.croom.rx][globalData.clevel.croom.ry] = 2;

            drawMinimap();
        }
        onroomchange();

        globalData.clevel.onRoomChangeHandler.push(onroomchange);

    }
    globalData.onLevelChangeHandler.push(onlevelchange);

    class rect
    {
        x;
        y;
        w;
        h;
        constructor(x, y, w, h)
        {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
    }

    function computeRects()
    {

        let rects = [];

        let tile = (dimensions - (rooms.length + 1) * space) / rooms.length;

        for(let x = 0; x < rooms.length; x++)
        {
            rects.push([]);
            for(let y = 0; y < rooms.length; y++)
            {
                let xx = space + x * (tile + space);
                let yy = space + y * (tile + space);
                rects[x].push(new rect(xx, yy, tile, tile));
            }
        }

        return rects;

    }

    mcv.addEventListener('mousemove', ev => {

        if(menuMode && portalSelectMode !== 1 && startPosSelectMode !== 1)
            return;

        const r = mcv.getBoundingClientRect();
        const px = ev.pageX - r.x;
        const py = ev.pageY - r.y;

        rooms = rooms.map(arr => arr.map(() => 0));

        const rects = computeRects();

        for(let x = 0; x < rects.length; x++)
        {
            let broken = false;
            for(let y = 0; y < rects.length; y++)
                if(px >= rects[x][y].x && py >= rects[x][y].y)
                    if(px <= rects[x][y].x + rects[x][y].w)
                        if(py <= rects[x][y].y + rects[x][y].h)
                        {
                            rooms[x][y] = 1;
                            broken = true;
                            break;
                        }
            if(broken)
                break;
        }

        rooms[globalData.clevel.croom.rx][globalData.clevel.croom.ry] = 2;

        drawMinimap();

    });
    mcv.addEventListener('mouseup', ev => {

        if(menuMode && portalSelectMode !== 1 && startPosSelectMode !== 1)
            return;

        const r = mcv.getBoundingClientRect();
        const px = ev.pageX - r.x;
        const py = ev.pageY - r.y;

        const rects = computeRects();

        for(let x = 0; x < rects.length; x++)
        {
            let broken = false;
            for(let y = 0; y < rects.length; y++)
                if(px >= rects[x][y].x && py >= rects[x][y].y)
                    if(px <= rects[x][y].x + rects[x][y].w)
                        if(py <= rects[x][y].y + rects[x][y].h)
                        {
                            if(portalSelectMode === 1)
                            {
                                if(editedTile)
                                {
                                    editedTile.portal.rx = x;
                                    editedTile.portal.ry = y;
                                }
                                portalSelectMode++;
                                document.getElementById('portalSelectWindow_title1').classList.add('hidden');
                                document.getElementById('portalSelectWindow_title2').classList.remove('hidden');
                            }
                            else if(startPosSelectMode === 1)
                            {
                                globalData.clevel.defaults.crx = x;
                                globalData.clevel.defaults.cry = y;
                                startPosSelectMode++;
                                document.getElementById('startPosSelectWindow_title1').classList.add('hidden');
                                document.getElementById('startPosSelectWindow_title2').classList.remove('hidden');
                            }
                            else
                                globalData.clevel.changeRoom(x, y);
                            broken = true;
                            break;
                        }
            if(broken)
                break;
        }

        rooms = rooms.map(arr => arr.map(() => 0));
        rooms[globalData.clevel.croom.rx][globalData.clevel.croom.ry] = 2;
        drawMinimap();

    });
    mcv.addEventListener('mouseleave', () => {

        if(menuMode && portalSelectMode !== 1 && startPosSelectMode !== 1)
            return;

        rooms = rooms.map(arr => arr.map(() => 0));
        rooms[globalData.clevel.croom.rx][globalData.clevel.croom.ry] = 2;
        drawMinimap();

    });

    document.addEventListener('keyup', keyev => {

        if(menuMode)
            return;

        const key = keyev.key;

        let rx = globalData.clevel.croom.rx;
        let ry = globalData.clevel.croom.ry;

        switch(key)
        {
            case 'i':
                if(ry === 0)
                    ry = globalData.clevel.rooms.length - 1;
                else
                    ry--;
                break;

            case 'j':
                if(rx === 0)
                    rx = globalData.clevel.rooms.length - 1;
                else
                    rx--;
                break;

            case 'k':
                if(ry === globalData.clevel.rooms.length - 1)
                    ry = 0;
                else
                    ry++;
                break;

            case 'l':
                if(rx === globalData.clevel.rooms.length - 1)
                    rx = 0;
                else
                    rx++;
                break;
        }

        globalData.clevel.changeRoom(rx, ry);

        drawMinimap();

    });

    function drawMinimap()
    {
        
        const rects = computeRects();

        for(let x = 0; x < rects.length; x++)
            for(let y = 0; y < rects.length; y++)
            {
                let color = '';
                switch(rooms[x][y])
                {
                    case 0:
                        color = colors.else;
                        break;
                    case 1:
                        color = colors.visited;
                        break;
                    case 2:
                        color = colors.player;
                        break;
                }

                ctx.fillStyle = color;
                ctx.fillRect(rects[x][y].x, rects[x][y].y, rects[x][y].w, rects[x][y].h);
            }

    }

}