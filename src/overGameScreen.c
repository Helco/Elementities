#include "globals.h"

void overGame_movePlayer (uint8_t dir);
void overGame_movePlayerTo (asciiPoint pos);
uint8_t overGame_getGameTile (int32_t x,int32_t y);
asciiBool overGame_handleEnemySight (Enemy* e);
asciiBool overGame_handleEnemiesSight ();

void overGame_movePlayer (uint8_t dir) {
	asciiPoint newPos = game.curOverWorld->playerPos;
	if (!game.isPlayerMovementLocked) {
		switch (dir) {
		case(DIR_UP):{newPos.y--;}break;
		case(DIR_DOWN):{newPos.y++;}break;
		case(DIR_LEFT):{newPos.x--;}break;
		case(DIR_RIGHT):{newPos.x++;}break;
		}
		overGame_movePlayerTo(newPos);
	}
}
void overGame_movePlayerTo (asciiPoint pos) {
	uint8_t gameTile = overGame_getGameTile (pos.x,pos.y),i;
	asciiPoint nextRoomPos;
	if (gameTile==TILE_DOOR) {
		nextRoomPos.x = pos.x + (pos.x-game.curOverWorld->playerPos.x);
		nextRoomPos.y = pos.y + (pos.y-game.curOverWorld->playerPos.y);
		showUpWorldRoomAt(*game.curOverWorld,nextRoomPos);
	}
	if (gameTile != TILE_SOLID)
		game.curOverWorld->playerPos = pos;
	if (!overGame_handleEnemiesSight ()) {
		switch (gameTile) {
		case(TILE_UPSTAIRS):{
			if (game.curLevelID != 0)
				goToLevel(game.curLevelID-1);
							}break;
		case(TILE_DOWNSTAIRS):{
			if (game.curLevelID != LEVEL_COUNT-1)
				goToLevel(game.curLevelID+1);
			else {
				game.hasWon = ASCII_TRUE;
				switchToScreen(mainMenuScreen);
				showMessageBox("You won!","Someone actually made it through the whole game :)");
			}
							  }break;
		case(TILE_SHOP):{
			switchToScreen(shopScreen);
						}break;
		case(TILE_DOOR):{
			game.curOverWorld->world.gameMap[pos.y*WORLD_WIDTH + pos.x] = TILE_NONE;
			game.curOverWorld->world.tileMap.address[pos.y*WORLD_WIDTH + pos.x] = '.';
						}break;
		}
	}
	game.needRedraw = ASCII_TRUE;
}
asciiBool overGame_handleEnemySight (Enemy* e) {
	uint8_t gameTile;
	int32_t x,y,len = game.curOverWorld->enemySight;
	asciiPoint player = game.curOverWorld->playerPos;
	if (asciiRectCollides (asciiRect(player.x,player.y,1,1),asciiRect(e->pos.x-len,e->pos.y,2*len,1))) {
		y = e->pos.y;
		for (x=min(e->pos.x,player.x);x<max(e->pos.x,player.x);x++) {
			gameTile = overGame_getGameTile(x,y);
			if (gameTile==TILE_SOLID || gameTile==TILE_DOOR)
				return ASCII_FALSE;
		}
		game.isPlayerMovementLocked = ASCII_TRUE;
		game.curEnemy = e;
		game.enemyDir = (e->pos.x<player.x ? DIR_RIGHT : DIR_LEFT);
		game.ticks = 60;
		return ASCII_TRUE;
	}
	else if (asciiRectCollides (asciiRect(player.x,player.y,1,1),asciiRect(e->pos.x,e->pos.y-len,1,2*len))) {
		x = e->pos.x;
		for (y=min(e->pos.y,player.y);y<max(e->pos.y,player.y);y++) {
			gameTile = overGame_getGameTile(x,y);
			if (gameTile==TILE_SOLID || gameTile==TILE_DOOR)
				return ASCII_FALSE;
		}
		game.isPlayerMovementLocked = ASCII_TRUE;
		game.curEnemy = e;
		game.enemyDir = (e->pos.y<player.y ? DIR_DOWN : DIR_UP);
		game.ticks = 60;
		return ASCII_TRUE;
	}
	else
		return ASCII_FALSE;
}
asciiBool overGame_handleEnemiesSight () {
	uint8_t i;
	for (i=0;i<game.curOverWorld->enemyCount;i++) {
		if (game.curOverWorld->enemies[i].enabled &&
			overGame_handleEnemySight(game.curOverWorld->enemies+i))
			return ASCII_TRUE;
	}
	return ASCII_FALSE;
}
uint8_t overGame_getGameTile (int32_t x,int32_t y) {
	if (x<0 || y<0 || x>=WORLD_WIDTH || y>=WORLD_HEIGHT)
		return TILE_SOLID;
	return game.curOverWorld->world.gameMap[y*WORLD_WIDTH + x];
}

void overGame_init (void) {
}

void overGame_update (void) {
	asciiPoint newPos;
	if (game.curEnemy) {
		game.ticks--;
		if (game.ticks == 0) {
			newPos = game.curEnemy->pos;
			switch (game.enemyDir) {
			case(DIR_UP):{newPos.y--;}break;
			case(DIR_DOWN):{newPos.y++;}break;
			case(DIR_LEFT):{newPos.x--;}break;
			case(DIR_RIGHT):{newPos.x++;}break;
			}
			if (newPos.x==game.curOverWorld->playerPos.x && newPos.y==game.curOverWorld->playerPos.y) {
				game.curEnemy->enabled = ASCII_FALSE;
				game.isPlayerMovementLocked = ASCII_FALSE;
				switchToScreen (fightPreScreen);
			}
			else {
				game.curEnemy->pos = newPos;
				game.ticks = 6;
				game.needRedraw = ASCII_TRUE;
			}
		}
	}
}

void overGame_render (void) {
	uint8_t i;
	char buffer[32];
	asciiClearScreen (game.engine);
	renderOverWorld (*game.curOverWorld);
	if (game.curEnemy)
		asciiDrawChar(game.engine,asciiChar('!',ASCII_COLOR_RED,ASCII_COLOR_BLACK),asciiPoint(game.curEnemy->pos.x,game.curEnemy->pos.y-1));
	i = strlen (game.curOverWorld->name);
	asciiDrawTextColored(game.engine,game.curOverWorld->name,asciiPoint(SCREEN_WIDTH-i,24),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	i = sprintf(buffer,"You have: %u$",game.playerMoney);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(SCREEN_WIDTH-i,0),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiFillRect(game.engine,asciiChar(' ',ASCII_COLOR_WHITE,ASCII_COLOR_BLACK),asciiRect(SCREEN_WIDTH-19,2,19,MAX_ELEMENTITIES*4+1));
	for (i=0;i<MAX_ELEMENTITIES;i++) {
		if (i<game.playerElementityCount)
			drawElementityBasicProfile(game.playerElementities+i,asciiPoint(SCREEN_WIDTH-19,3+i*4));
		else
			asciiDrawFilledRectangleColored(game.engine,asciiRect(SCREEN_WIDTH-19,3+i*4,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	}
}

void overGame_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (isDown) {
		switch(key) {
		case(ASCII_KEY_UP):{overGame_movePlayer(DIR_UP);}break;
		case(ASCII_KEY_DOWN):{overGame_movePlayer(DIR_DOWN);}break;
		case(ASCII_KEY_LEFT):{overGame_movePlayer(DIR_LEFT);}break;
		case(ASCII_KEY_RIGHT):{overGame_movePlayer(DIR_RIGHT);}break;
		}
	}
}

void overGame_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void overGame_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen overGameScreen = {
	overGame_init,
	overGame_update,
	overGame_render,
	overGame_keyHandler,
	overGame_mouseKeyHandler,
	overGame_mouseMoveHandler
};
