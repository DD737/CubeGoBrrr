
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

    function drawMinimap()
    {

        let tile = (dimensions - (rooms.length + 1) * space) / rooms.length;

        for(let x = 0; x < rooms.length; x++)
            for(let y = 0; y < rooms.length; y++)
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

                let xx = space + x * (tile + space);
                let yy = space + y * (tile + space);

                ctx.fillStyle = color;
                ctx.fillRect(xx, yy, tile, tile);
            }

    }

}