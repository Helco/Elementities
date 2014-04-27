#ifndef _GLOBALS_H_
#define _GLOBALS_H_
#include "asciiLib.h"
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define SCREEN_WIDTH 80 //Good values for VGA
#define SCREEN_HEIGHT 25
#define WORLD_WIDTH 60
#define WORLD_HEIGHT 25

#define LEVEL_COUNT 8

#define MIN_NAME_LEN 3
#define MAX_NAME_LEN 8
#define ELEMENTITIES_PER_ELEMENT 4
#define ELEMENTITIES_COUNT (6*ELEMENTITIES_PER_ELEMENT)
#define MAX_ELEMENTITIES 5
#define MAX_PROJECTILES 32

#ifndef max
#define max(a,b) ((a)>(b)?(a):(b))
#endif
#ifndef min
#define min(a,b) ((a)<(b)?(a):(b))
#endif

enum {
	STAT_ATTACK=0,
	STAT_ATTACK_RANGE,
	STAT_ATTACK_FREQUENCE,
	STAT_DEFENSE,
	STAT_SPEED,
	STAT_MAX_HP,
	STAT_COUNT,

	HIT_NOT_EFFECTIVE=0,
	HIT_EFFECTIVE,
	HIT_VERY_EFFECTIVE,

	ELEMENT_NATURE=0,
	ELEMENT_WATER,
	ELEMENT_LIGHT,
	ELEMENT_STONE,
	ELEMENT_FIRE,
	ELEMENT_DARKNESS,
	ELEMENT_COUNT,

	TILE_NONE=0,
	TILE_SOLID,
	TILE_DOOR,
	TILE_UPSTAIRS,
	TILE_DOWNSTAIRS,
	TILE_ENEMY,
	TILE_SHOP,
	TILE_FLEE,
	TILE_COUNT,

	DIR_UP=0,
	DIR_DOWN,
	DIR_LEFT,
	DIR_RIGHT
};

typedef void (*initCallback) (void);
typedef void (*updateCallback) (void);
typedef void (*renderCallback) (void);
typedef struct _Screen {
	initCallback init;
	updateCallback update;
	renderCallback render;
	asciiKeyEventCallback keyHandler;
	asciiMouseKeyEventCallback mouseKeyHandler;
	asciiMouseMoveEventCallback mouseMoveHandler;
} Screen;

typedef struct _Elementity {
	uint8_t stats[STAT_COUNT];

	uint8_t elementityID;
	uint8_t level;
	uint8_t hp;
	uint32_t experience;
	uint32_t nextLevel;
	uint32_t lastAttackTicks;
} Elementity;
typedef struct _ElementityInfo {
	char name [9];
	char character;
	uint8_t element;
	float value;
	float statsValue[STAT_COUNT];
	Elementity startObject;
} ElementityInfo;
typedef struct _Enemy {
	asciiBool enabled;
	asciiPoint pos;
	Elementity elementities[MAX_ELEMENTITIES];
	uint8_t elementityCount;
} Enemy;
typedef struct _Projectile {
	asciiBool isPlayer;
	asciiPoint pos;
	uint8_t dir;
	uint32_t lastTick;
	Elementity* source;
} Projectile;
typedef struct _World {
	uint8_t* gameMap;
	asciiBitmap tileMap;
	asciiColor backColor,foreColor;
} World;
typedef struct _OverWorld {
	const char* name;
	World world;
	asciiBitmap darkMap;
	asciiRect* rooms;
	uint8_t roomCount;
	asciiPoint playerPos,
		upStairsPos,
		downStairsPos;
	Enemy* enemies;
	uint8_t enemyCount,enemySight;
	Elementity shopElementities[MAX_ELEMENTITIES];
	uint8_t shopElementityCount;
	uint32_t shopPrices[1+2*MAX_ELEMENTITIES];
} OverWorld;
typedef struct _ArenaWorld {
	World world;
	asciiPoint playerPos,
		enemyPos,
		fleePos;
	uint8_t playerElementityIndex,
		enemyElementityIndex,
		playerShootDir,
		enemyShootDir,
		lastEffect;
	asciiBool isPlayerShooting,
		isEnemyShooting;
	Elementity* playerElementity,
		*enemyElementity;
	ElementityInfo* playerElementityInfo,
		*enemyElementityInfo;
	uint32_t lastPlayerWalkTick,
		lastEnemyWalkTick,
		lastPlayerAttackTick,
		lastEnemyAttackTick,
		lastEnemyChangeTick,
		lastPlayerChangeTick,
		playerExperienceGain [MAX_ELEMENTITIES],
		playerMoneyGain;
	Projectile projectiles [MAX_PROJECTILES];
	uint8_t projectileCount,
		nextEnemyIndex,
		nextPlayerIndex;
	const char* lastDefeater,
		*lastDefeated;
	asciiBool lastDefeatedByPlayer;
} ArenaWorld;

struct _Game {
	asciiEngine* engine;
	asciiBool needRedraw;
	Screen currentScreen,
		lastScreen;
	uint32_t ticks, //general purpose
		state;
	asciiBool hasWon;
	const char* messageTitle,
		* messageText;

	Enemy* curEnemy,
		wildElementity;
	uint8_t enemyDir,playerDir;
	uint8_t currentPage;

	asciiBool isPlayerMovementLocked;
	Elementity playerElementities[MAX_ELEMENTITIES];
	uint8_t playerElementityCount;
	uint32_t playerMoney;

	OverWorld* curOverWorld;
	uint8_t curLevelID;
	ArenaWorld curArenaWorld;
	OverWorld overWorlds [LEVEL_COUNT];
	uint8_t generatedOverWorlds;
	uint32_t baseSeed;

	ElementityInfo elementities [ELEMENTITIES_COUNT];
} game;
extern struct _Game game;
extern Screen overGameScreen,
	fightGameScreen,
	fightWonScreen,
	fightLostScreen,
	fightPreScreen,
	shopScreen,
	mainMenuScreen,
	encyclopediaScreen,
	messageBoxScreen;

void initGame (uint32_t seed);
void freeGame ();
void goToLevel (uint8_t levelID);
void generateElementities ();
void levelUpElementity (Elementity* e);
void damageElementity (Elementity* attacker,Elementity* victim);
uint32_t getNextLevelExperience (ElementityInfo* info,uint8_t level);
uint32_t getKillExperience (ElementityInfo* info,uint8_t level);
uint8_t getEffect (uint8_t attackElement,uint8_t victimElement);
asciiColor getElementColor (uint8_t element);
asciiColor getElementForeColor (uint8_t element);
void drawElementity (Elementity* e,asciiPoint pos);
void drawElementityHP (Elementity* e,asciiPoint pos);
void drawElementityName (Elementity* e,asciiPoint pos);
void drawElementityProfile (Elementity* e,asciiPoint pos);
void drawElementitySmallProfile (Elementity* e,asciiPoint pos);
void drawElementityHPProfile (Elementity* e,asciiPoint pos);
void drawElementityBasicProfile (Elementity* e,asciiPoint pos); //a few too many of these functions, isn't it?

void loadRandomArena (asciiBool mayFlee);

OverWorld generateWorld (uint32_t seed,uint8_t levelID,const char* name,asciiColor backColor,asciiColor foreColor,int32_t minRooms,int32_t maxRooms,uint8_t enemySight);
void freeOverWorld (OverWorld w);
void freeArenaWorld (ArenaWorld w);
void freeWorld (World w);
void renderWorld (World w);
void renderOverWorld (OverWorld w);
void showUpWorldRoomAt (OverWorld w,asciiPoint at);
void showUpWorldRoom (OverWorld w,uint8_t index);

//emscripten has some weeiiiird stuff going on with the original rand
#define srand initRandom
#define rand getRandom
void initRandom (unsigned int seed);
int getRandom ();
void switchToScreen (Screen screen);
void switchToLastScreen ();
void showMessageBox (const char* title,const char* text);
//soon to be added into the offical asciiLib API
void asciiClearScreen (asciiEngine* e);
asciiBool asciiRectCollides (asciiRect r1,asciiRect r2);
asciiBool asciiRectFullyContains (asciiRect r1,asciiRect r2);

#endif //_GLOBALS_H_