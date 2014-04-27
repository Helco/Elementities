#include "globals.h"

void renderWorld (World w) {
	asciiDrawBitmapColored (game.engine,w.tileMap,asciiRect(0,0,0,0),w.backColor,w.foreColor);
}
void renderOverWorld (OverWorld w) {
	uint8_t i;
	renderWorld (w.world);
	for (i=0;i<w.enemyCount;i++) {
		if (w.enemies[i].enabled) 
			asciiDrawChar (game.engine,asciiChar('@',ASCII_COLOR_RED,ASCII_COLOR_WHITE),w.enemies[i].pos);
	}
	asciiDrawChar (game.engine,asciiChar('@',ASCII_COLOR_GREEN,ASCII_COLOR_BLACK),w.playerPos);
	asciiDrawBitmapColored (game.engine,w.darkMap,asciiRect(0,0,0,0),w.world.backColor,w.world.foreColor);
}

void showUpWorldRoomAt (OverWorld w,asciiPoint at) {
	uint8_t i;
	for (i=0;i<w.roomCount;i++) {
		if (asciiRectCollides(w.rooms[i],asciiRect(at.x,at.y,1,1))) {
			showUpWorldRoom (w,i);
			break;
		}
	}
}
void showUpWorldRoom (OverWorld w,uint8_t i) {
	uint32_t x,y;
	for (y=w.rooms[i].offset.y-1;y<w.rooms[i].offset.y+w.rooms[i].size.y+1;y++) {
		for (x=w.rooms[i].offset.x-1;x<w.rooms[i].offset.x+w.rooms[i].size.x+1;x++)
			w.darkMap.address[y*SCREEN_WIDTH + x] = 0;
	}
	w.rooms[i].size.x = 0;
	w.rooms[i].size.y = 0;
}

void freeWorld (World w) {
	if (w.gameMap) {
		free(w.gameMap);
		asciiFreeBitmap (&w.tileMap);
	}
}
void freeOverWorld (OverWorld w) {
	if (w.world.gameMap) {
		freeWorld(w.world);
		asciiFreeBitmap (&w.darkMap);
		free(w.rooms);
		free(w.enemies);
	}
}
void freeArenaWorld (ArenaWorld w) {
	if (w.world.gameMap)
		freeWorld(w.world);
}

#define MIN_ROOMS 10
#define MAX_ROOMS 20
#define MAX_ITERATIONS 3000

asciiPoint generateRoomSize () {
	asciiPoint s;
	s.x = 5+(rand()%6);
	s.y = 5+(rand()%6);
	return s;
}
asciiRect generateNewRoom (asciiRect from,uint8_t direction,asciiPoint* doorPos) {
	asciiRect to;
	uint8_t atFrom,atTo;
	to.size = generateRoomSize ();
	if (direction==DIR_UP || direction==DIR_DOWN) {
		atFrom = rand()%from.size.x;
		atTo = rand()%to.size.x;
	}
	else {
		atFrom = rand()%from.size.y;
		atTo = rand()%to.size.y;
	}
	switch (direction) {
	case(DIR_UP):{
		*doorPos = asciiPoint (from.offset.x+atFrom,from.offset.y-1);
		to.offset = asciiPoint (doorPos->x-atTo,doorPos->y-to.size.y);
				 }break;
	case(DIR_DOWN):{
		*doorPos = asciiPoint (from.offset.x+atFrom,from.offset.y+from.size.y);
		to.offset = asciiPoint (doorPos->x-atTo,doorPos->y+1);
				   }break;
	case(DIR_LEFT):{
		*doorPos = asciiPoint (from.offset.x-1,from.offset.y+atFrom);
		to.offset = asciiPoint (doorPos->x-to.size.x,doorPos->y-atTo);
				   }break;
	case(DIR_RIGHT):{
		*doorPos = asciiPoint (from.offset.x+from.size.x,from.offset.y+atFrom);
		to.offset = asciiPoint (doorPos->x+1,doorPos->y-atTo);
					}break;
	}
	return to;
}
asciiBool roomCollides (asciiRect r1,asciiRect r2) {
	r1.offset.x--;
	r1.offset.y--;
	r1.size.x += 2;
	r1.size.y += 2;
	return asciiRectCollides (r1,r2);
}
asciiBool isFree (World* w,uint32_t x,uint32_t y) {
	return (w->gameMap[y*WORLD_WIDTH + x]==TILE_NONE);
}
void drawTile (World* w,uint32_t x,uint32_t y,char c) {
	uint32_t index = y*WORLD_WIDTH + x;
	w->tileMap.address[index] = c;
	switch (c) {
	case('#'):{w->gameMap[index] = TILE_DOOR;}break;
	case('H'):{w->gameMap[index] = TILE_UPSTAIRS;}break;
	case('O'):{w->gameMap[index] = TILE_DOWNSTAIRS;}break;
	case('$'):{w->gameMap[index] = TILE_SHOP;}break;
	default:{w->gameMap[index] = TILE_SOLID;}break;
	}
}
void setTile (World* w,uint32_t x,uint32_t y,uint8_t game) {
	w->gameMap[y*WORLD_WIDTH + x] = game;
}
asciiPoint getRandomFreeTile (World* w,asciiRect rect) {
	asciiPoint pos;
	do {
		pos = rect.offset;
		pos.x += rand()%rect.size.x;
		pos.y += rand()%rect.size.y;
	} while (!isFree(w,pos.x,pos.y));
	return pos;
}
asciiPoint setTileRandom (World* w,asciiRect rect,uint8_t game) {
	asciiPoint pos = getRandomFreeTile (w,rect);
	setTile(w,pos.x,pos.y,game);
	return pos;
}
asciiPoint drawTileRandom (World* w,asciiRect rect,char c) {
	asciiPoint pos = getRandomFreeTile(w,rect);
	drawTile(w,pos.x,pos.y,c);
	return pos;
}
uint32_t getRoomDistance (asciiRect r1,asciiRect r2) {
	r1.offset.x += r1.size.x/2;
	r1.offset.y += r1.size.y/2;
	r2.offset.x += r2.size.x/2;
	r2.offset.y += r2.size.y/2;
	r1.offset.x -= r2.offset.x;
	r1.offset.y -= r2.offset.y;
	return (uint32_t)(r1.offset.x*r1.offset.x + r1.offset.y*r1.offset.y);
}
uint8_t getRoomEnemyCount (asciiPoint size) {
	return ((rand()%8)>0)+(rand()%max(1,(size.x*size.y/32)));
}
OverWorld generateWorld (uint32_t seed,uint8_t levelID,const char* name,asciiColor backColor,asciiColor foreColor,int32_t minRooms,int32_t maxRooms,uint8_t enemySight) {
	const uint32_t darkMapStuffCount = 8;
	const char* darkMapStuff = ".:,;x+*'";
	OverWorld w;
	asciiRect rooms[MAX_ROOMS],
		newRoom;
	asciiPoint doors[MAX_ROOMS];
	uint8_t roomEnemies[MAX_ROOMS];
	uint32_t roomCount = 1,
		i,j,k,level,x,y,itCount = 0,
		maxRoomDistance = 0,maxRoom1 = 0,maxRoom2 = 1,dist,
		enemyCount = 0;

	w.world.gameMap = (uint8_t*)malloc(WORLD_WIDTH*WORLD_HEIGHT);
	memset(w.world.gameMap,TILE_NONE,WORLD_WIDTH*WORLD_HEIGHT);
	w.world.tileMap = asciiCreateBitmap(asciiPoint(WORLD_WIDTH,WORLD_HEIGHT));
	w.darkMap = asciiCreateBitmap(asciiPoint(SCREEN_WIDTH,SCREEN_HEIGHT));
	w.darkMap.trans = 0;
	w.world.backColor = backColor;
	w.world.foreColor = foreColor;
	w.name = name;
	w.enemySight = enemySight;
	srand(seed);
	for (i=0;i<SCREEN_WIDTH*SCREEN_HEIGHT;i++) {
		if (rand()%25 == 0)
			w.darkMap.address[i] = darkMapStuff [rand()%darkMapStuffCount];
	}
	srand(seed);

	rooms[0].size = generateRoomSize ();
	rooms[0].offset.x = WORLD_WIDTH/2-rooms[0].size.x/2;
	rooms[0].offset.y = WORLD_HEIGHT/2-rooms[0].size.y/2;
	roomEnemies[0] = getRoomEnemyCount(rooms[0].size);
	enemyCount = roomEnemies[0];

	while (roomCount < minRooms || roomCount != maxRooms) {
		newRoom = generateNewRoom (rooms[rand()%roomCount],rand()%4,doors+roomCount-1);
		if (asciiRectFullyContains(asciiRect(1,1,WORLD_WIDTH-2,WORLD_HEIGHT-2),newRoom)) {
			for (i=0;i<roomCount;i++)
				if (roomCollides(rooms[i],newRoom))
					break;
			if (i>=roomCount) {
				rooms[roomCount] = newRoom;
				roomEnemies[roomCount] = getRoomEnemyCount(rooms[roomCount].size);
				enemyCount += roomEnemies[roomCount];
				roomCount++;
				if (roomCount>=minRooms && rand()%(maxRooms-roomCount)==0)
					break;
			}
		}
		itCount++;
		if (itCount >= MAX_ITERATIONS) {
			roomCount = 1;
			itCount = 0;
			rooms[0].size = generateRoomSize ();
			rooms[0].offset.x = WORLD_WIDTH/2-rooms[0].size.x/2;
			rooms[0].offset.y = WORLD_HEIGHT/2-rooms[0].size.y/2;
			roomEnemies[0] = getRoomEnemyCount(rooms[0].size);
			enemyCount = roomEnemies[0];
		}
	}
	w.roomCount = roomCount;
	w.rooms = (asciiRect*)malloc(sizeof(asciiRect)*roomCount);
	memcpy(w.rooms,rooms,sizeof(asciiRect)*roomCount);
	w.enemyCount = 0;
	w.enemies = (Enemy*)malloc(sizeof(Enemy)*enemyCount);
	memset(w.enemies,0,sizeof(Enemy)*enemyCount);

	for (i=0;i<roomCount;i++) {
		for (y=rooms[i].offset.y;y<rooms[i].offset.y+rooms[i].size.y;y++) {
			for (x=rooms[i].offset.x;x<rooms[i].offset.x+rooms[i].size.x;x++) {				
				w.world.tileMap.address[y*WORLD_WIDTH + x] = '.';
			}
			drawTile (&w.world,rooms[i].offset.x-1,y,'|');
			drawTile (&w.world,rooms[i].offset.x+rooms[i].size.x,y,'|');
		}
		for (x=rooms[i].offset.x;x<rooms[i].offset.x+rooms[i].size.x;x++) {
			drawTile (&w.world,x,rooms[i].offset.y-1,'-');
			drawTile (&w.world,x,rooms[i].offset.y+rooms[i].size.y,'-');
		}
		for (j=i+1;j<roomCount;j++) {
			dist = getRoomDistance(rooms[i],rooms[j]);
			if (dist > maxRoomDistance) {
				maxRoomDistance = dist;
				maxRoom1 = i;
				maxRoom2 = j;
			}
		}
	}
	for (i=0;i<roomCount;i++) {
		drawTile(&w.world,rooms[i].offset.x-1,rooms[i].offset.y-1,'+');
		drawTile(&w.world,rooms[i].offset.x+rooms[i].size.x,rooms[i].offset.y-1,'+');
		drawTile(&w.world,rooms[i].offset.x+rooms[i].size.x,rooms[i].offset.y+rooms[i].size.y,'+');
		drawTile(&w.world,rooms[i].offset.x-1,rooms[i].offset.y+rooms[i].size.y,'+');
		if (i < roomCount-1)
			drawTile(&w.world,doors[i].x,doors[i].y,'#');
		if (i!= maxRoom1) {
			for (j=0;j<roomEnemies[i];j++)
				w.enemies[w.enemyCount++].pos = setTileRandom(&w.world,rooms[i],TILE_ENEMY);
		}
	}
	//generate start room
	w.playerPos = w.upStairsPos =  drawTileRandom(&w.world,rooms[maxRoom1],'H');
	drawTileRandom(&w.world,rooms[maxRoom1],'$');
	showUpWorldRoom(w,maxRoom1);
	//generate end room
	w.downStairsPos = drawTileRandom(&w.world,rooms[maxRoom2],'O');
	//generate enemies
	for (i=0;i<enemyCount;i++) {
		w.enemies[i].enabled = ASCII_TRUE;
		w.enemies[i].elementityCount = levelID + 1 + (rand()%8 == 0);
		for (j=0;j<w.enemies[i].elementityCount;j++) {
			level = max(0,levelID*2 + (rand()%3));
			w.enemies[i].elementities[j] = game.elementities[rand()%ELEMENTITIES_COUNT].startObject;
			while (w.enemies[i].elementities[j].level!=level)
				levelUpElementity(w.enemies[i].elementities+j);
		}
	}
	//generate shop elementities
	w.shopElementityCount = rand()%6;
	for (i=0;i<w.shopElementityCount;i++) {
		level = max(0,levelID*2 + (rand()%3));
		w.shopElementities[i] = game.elementities[rand()%ELEMENTITIES_COUNT].startObject;
		while (w.shopElementities[i].level != level)
			levelUpElementity(w.shopElementities+i);
		w.shopElementities[i].experience = getNextLevelExperience(game.elementities+w.shopElementities[i].elementityID,max(0,(int32_t)level-1));
	}
	return w;
}