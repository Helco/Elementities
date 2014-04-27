#include "globals.h"

#define ARENA_COUNT 2

const char* arenas[ARENA_COUNT]={
	"                                                            "
	"                                                            "
	"     +------------------------------------------------+     "
	"     |................................................|     "
	"     |.......................E........................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |......................+~~+......................|     "
	"     |...=========..........!**!..........=========...|     "
	"     |......................+~~+......................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |................................................|     "
	"     |........................P.......................|     "
	"     |................................................|     "
	"     +------------------------------------------------+     "
	"                                                            "
	"                                                            ",

	"                                                            "
	"                                                            "
	"          +--------------------------------------+          "
	"          |......................................|          "
	"          |..................E...................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |.................+~~+.................|          "
	"          |...=========.....!**!.....=========...|          "
	"          |.................+~~+.................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |......................................|          "
	"          |...................P..................|          "
	"          |......................................|          "
	"          +--------------------------------------+          "
	"                                                            "
	"                                                            "
};

void loadRandomArena (asciiBool mayFlee) {
	uint32_t i;
	asciiTextchar* textPtr;
	uint8_t* gamePtr;
	const char* mapPtr;
	if (game.curArenaWorld.world.gameMap==0) {
		game.curArenaWorld.world.gameMap = (uint8_t*)malloc(WORLD_WIDTH*WORLD_HEIGHT);
		game.curArenaWorld.world.tileMap = asciiCreateBitmap(asciiPoint(WORLD_WIDTH,WORLD_HEIGHT));
		game.curArenaWorld.world.backColor = ASCII_COLOR_WHITE;
		game.curArenaWorld.world.foreColor = ASCII_COLOR_BLACK;
	}
	textPtr = game.curArenaWorld.world.tileMap.address;
	gamePtr = game.curArenaWorld.world.gameMap;
	mapPtr = arenas[rand()%ARENA_COUNT];
	for (i=0;i<WORLD_WIDTH*WORLD_HEIGHT;i++) {
		switch (*mapPtr) {
		case('P'):{
			*textPtr = '.';
			*gamePtr = TILE_NONE;
			game.curArenaWorld.playerPos = asciiPoint(i%WORLD_WIDTH,i/WORLD_WIDTH);
				  }break;
		case('E'):{
			*textPtr = '.';
			*gamePtr = TILE_NONE;
			game.curArenaWorld.enemyPos = asciiPoint(i%WORLD_WIDTH,i/WORLD_WIDTH);
				  }break;
		case('*'):{
			*textPtr = '*';
			*gamePtr = TILE_FLEE;
			game.curArenaWorld.fleePos = asciiPoint(i%WORLD_WIDTH,i/WORLD_WIDTH);
				  }break;
		case('~'):{
			*textPtr = (mayFlee ? '.' : '-');
			*gamePtr = (mayFlee ? TILE_NONE : TILE_SOLID);
				  }break;
		case('!'):{
			*textPtr = (mayFlee ? '.' : '|');
			*gamePtr = (mayFlee ? TILE_NONE : TILE_SOLID);
				  }break;
		case('.'):{
			*textPtr = '.';
			*gamePtr = TILE_NONE;
				  }break;
		default:{
			*textPtr = *mapPtr;
			*gamePtr = TILE_SOLID;
				}break;
		}
		mapPtr++;
		textPtr++;
		gamePtr++;
	}
}