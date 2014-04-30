#include "globals.h"

#define WALK_TICKS 7
#define ATTACK_TICKS 80
#define CHANGE_TICKS 50
#define PROJECTILE_TICKS 1
#define DEATH (MAX_ELEMENTITIES+1)
#define MIN_DISTANCE (6*6)

void fightGameScreen_switchPlayerElementity (uint8_t i);
void fightGameScreen_switchEnemyElementity (uint8_t i);
void fightGameScreen_movePlayer (uint8_t i);
void fightGameScreen_moveEnemy ();
uint8_t fightGameScreen_getGameTile (int32_t x,int32_t y);
void fightGameScreen_spawnProjectile (asciiBool isPlayer);
void fightGameScreen_destroyProjectile (uint8_t id);

void fightGameScreen_switchPlayerElementity (uint8_t i) {
	game.curArenaWorld.playerElementityIndex = i;
	game.curArenaWorld.playerElementity = game.playerElementities+i;
	game.curArenaWorld.playerElementityInfo = game.elementities + game.playerElementities[i].elementityID;
	game.needRedraw = ASCII_TRUE;
}
void fightGameScreen_switchEnemyElementity (uint8_t i) {
	game.curArenaWorld.enemyElementityIndex = i;
	game.curArenaWorld.enemyElementity = game.curEnemy->elementities+i;
	game.curArenaWorld.enemyElementityInfo = game.elementities + game.curEnemy->elementities[i].elementityID;
	game.needRedraw = ASCII_TRUE;
}
void fightGameScreen_movePlayer (uint8_t dir) {
	asciiPoint newPos = game.curArenaWorld.playerPos;
	uint8_t gameTile;
	switch (dir) {
	case(DIR_UP):{newPos.y--;}break;
	case(DIR_DOWN):{newPos.y++;}break;
	case(DIR_LEFT):{newPos.x--;}break;
	case(DIR_RIGHT):{newPos.x++;}break;
	}
	game.playerDir = dir;
	game.needRedraw = ASCII_TRUE;
	gameTile = fightGameScreen_getGameTile (newPos.x,newPos.y);
	if ((newPos.x!=game.curArenaWorld.enemyPos.x || newPos.y!=game.curArenaWorld.enemyPos.y) &&
		gameTile != TILE_SOLID)
		game.curArenaWorld.playerPos = newPos;
}
void fightGameScreen_moveEnemy () {
	asciiBool randomMovement = ASCII_FALSE;
	asciiBool randomShooting = ASCII_FALSE;
	asciiBool noChange = ASCII_FALSE;
	asciiBool halfLife,shootAxe;
	asciiPoint newPos = game.curArenaWorld.enemyPos,diff,
		playerPos = game.curArenaWorld.playerPos;
	uint8_t gameTile,newDir,i;
	uint32_t dists[4];
	if (game.curArenaWorld.enemyElementity->level<3) {
		randomMovement = ASCII_TRUE;
		randomShooting = ASCII_TRUE;
		noChange = ASCII_TRUE;
	}
	else if (game.curArenaWorld.enemyElementity->level<4)
		randomMovement = ASCII_TRUE;
	if (randomMovement) {
		if (rand()%5 == 0)
			game.enemyDir = rand()%4;
		switch (game.enemyDir) {
		case(DIR_UP):{newPos.y--;}break;
		case(DIR_DOWN):{newPos.y++;}break;
		case(DIR_LEFT):{newPos.x--;}break;
		case(DIR_RIGHT):{newPos.x++;}break;
		}
		gameTile = fightGameScreen_getGameTile(newPos.x,newPos.y);
		if ((newPos.x!=game.curArenaWorld.playerPos.x || newPos.y!=game.curArenaWorld.playerPos.y) &&
			gameTile != TILE_SOLID)
			game.curArenaWorld.enemyPos = newPos;
		else {
			do {
				newDir = rand()%4;
			} while (newDir == game.enemyDir);
		}
	}
	else {
		halfLife = (2*game.curArenaWorld.enemyElementity->hp < game.curArenaWorld.enemyElementity->stats[STAT_MAX_HP]);
		if (rand()%10 == 0)
			halfLife = !halfLife;
		for (i=0;i<4;i++) {
			newPos = game.curArenaWorld.enemyPos;
			switch (i) {
			case(DIR_UP):{newPos.y--;}break;
			case(DIR_DOWN):{newPos.y++;}break;
			case(DIR_LEFT):{newPos.x--;}break;
			case(DIR_RIGHT):{newPos.x++;}break;
			}
			diff.x = newPos.x - playerPos.x;
			diff.y = newPos.y - playerPos.y;
			dists[i] = diff.x*diff.x + diff.y*diff.y;
		}
		game.enemyDir = 0;
		for (i=1;i<4;i++) {
			if (halfLife && dists[i]>dists[game.enemyDir] && dists[i]>=MIN_DISTANCE)
				game.enemyDir = i;
			if (!halfLife && dists[i]<dists[game.enemyDir] && dists[i]>=MIN_DISTANCE)
				game.enemyDir = i;
		}
		newPos = game.curArenaWorld.enemyPos;
		switch (game.enemyDir) {
		case(DIR_UP):{newPos.y--;}break;
		case(DIR_DOWN):{newPos.y++;}break;
		case(DIR_LEFT):{newPos.x--;}break;
		case(DIR_RIGHT):{newPos.x++;}break;
		}
		gameTile = fightGameScreen_getGameTile(newPos.x,newPos.y);
		if ((newPos.x!=game.curArenaWorld.playerPos.x || newPos.y!=game.curArenaWorld.playerPos.y) &&
			gameTile != TILE_SOLID)
			game.curArenaWorld.enemyPos = newPos;
		else {
			game.enemyDir = rand()%4;
			newPos = game.curArenaWorld.enemyPos;
			switch (game.enemyDir) {
			case(DIR_UP):{newPos.y--;}break;
			case(DIR_DOWN):{newPos.y++;}break;
			case(DIR_LEFT):{newPos.x--;}break;
			case(DIR_RIGHT):{newPos.x++;}break;
			}
			gameTile = fightGameScreen_getGameTile(newPos.x,newPos.y);
			if ((newPos.x!=game.curArenaWorld.playerPos.x || newPos.y!=game.curArenaWorld.playerPos.y) &&
				gameTile != TILE_SOLID)
				game.curArenaWorld.enemyPos = newPos;
		}
	}
	if (randomShooting) {
		if (rand()%4 == 0)
			game.curArenaWorld.enemyShootDir = rand()%4;
		if (rand()%4 == 0)
			game.curArenaWorld.isEnemyShooting = !game.curArenaWorld.isEnemyShooting;
	}
	else {
		game.curArenaWorld.isEnemyShooting = ASCII_TRUE;
		newPos = game.curArenaWorld.enemyPos;
		diff.x = newPos.x-playerPos.x;
		diff.y = newPos.y-playerPos.y;
		shootAxe = (diff.x*diff.x) < (diff.y*diff.y);
		if (shootAxe)
			game.curArenaWorld.enemyShootDir = (newPos.y<playerPos.y ? DIR_DOWN : DIR_UP);
		else
			game.curArenaWorld.enemyShootDir = (newPos.x<playerPos.x ? DIR_RIGHT : DIR_LEFT);
	}
	if (!noChange && 3*game.curArenaWorld.enemyElementity->hp < game.curArenaWorld.enemyElementity->stats[STAT_MAX_HP] &&
		rand()%30 ==0 ) {
			game.curArenaWorld.lastEnemyChangeTick = game.ticks;
			do {
				game.curArenaWorld.nextEnemyIndex = rand()%game.curEnemy->elementityCount;
			} while (game.curEnemy->elementities[game.curArenaWorld.nextEnemyIndex].hp == 0);
	}
	game.needRedraw = ASCII_TRUE;
}
uint8_t fightGameScreen_getGameTile (int32_t x,int32_t y) {
	if (x<0 || y<0 || x>=WORLD_WIDTH || y>=WORLD_HEIGHT)
		return TILE_SOLID;
	return game.curArenaWorld.world.gameMap[y*WORLD_WIDTH + x];
}
void fightGameScreen_spawnProjectile (asciiBool isPlayer) {
	Projectile p;
	if (game.curArenaWorld.projectileCount==MAX_PROJECTILES)
		fightGameScreen_destroyProjectile (0); //TODO: Debug if this ever occurs
	p.isPlayer = isPlayer;
	p.dir = (isPlayer ? game.curArenaWorld.playerShootDir : game.curArenaWorld.enemyShootDir);
	p.source = (isPlayer ? game.curArenaWorld.playerElementity : game.curArenaWorld.enemyElementity);
	p.pos = (isPlayer ? game.curArenaWorld.playerPos : game.curArenaWorld.enemyPos);
	p.lastTick = game.ticks;
	game.curArenaWorld.projectiles[game.curArenaWorld.projectileCount++] = p;
	game.needRedraw = ASCII_TRUE;
}
void fightGameScreen_destroyProjectile (uint8_t id) {
	if (id+1 != game.curArenaWorld.projectileCount)
		memmove(game.curArenaWorld.projectiles+id,game.curArenaWorld.projectiles+id+1,
			sizeof(Projectile)*game.curArenaWorld.projectileCount-id-1);
	game.curArenaWorld.projectileCount--;
	game.needRedraw = ASCII_TRUE;
}

void fightGameScreen_init (void) {
	uint8_t i;
	for (i=0;i<MAX_ELEMENTITIES;i++)
		game.curArenaWorld.playerExperienceGain[i] = 0;
	game.curArenaWorld.playerMoneyGain = 0;
	game.ticks = 0;
	game.playerDir = DIR_UP;
	game.curArenaWorld.projectileCount = 0;
	game.curArenaWorld.lastEnemyAttackTick = 0;
	game.curArenaWorld.lastEnemyWalkTick = 1;
	game.curArenaWorld.lastEnemyChangeTick = 0;
	game.curArenaWorld.nextEnemyIndex = MAX_ELEMENTITIES;
	game.curArenaWorld.lastPlayerAttackTick = 0;
	game.curArenaWorld.lastPlayerWalkTick = 0;
	game.curArenaWorld.lastPlayerChangeTick = 0;
	game.curArenaWorld.nextPlayerIndex = MAX_ELEMENTITIES;
	game.curArenaWorld.lastEffect = HIT_EFFECTIVE;
	game.curArenaWorld.lastDefeated = 0;
	game.curArenaWorld.lastDefeater = 0;
	loadRandomArena (game.curEnemy == &game.wildElementity);
	fightGameScreen_switchPlayerElementity(0);
	fightGameScreen_switchEnemyElementity(0);
}

void fightGameScreen_update (void) {
	uint8_t i,j,gameTile;
	Projectile* p;
	uint32_t playerAttackTicks = game.curArenaWorld.playerElementity->stats[STAT_ATTACK_FREQUENCE],
		enemyAttackTicks = game.curArenaWorld.enemyElementity->stats[STAT_ATTACK_FREQUENCE],
		expGain;
	playerAttackTicks = max(1,ATTACK_TICKS - playerAttackTicks*playerAttackTicks/2);
	enemyAttackTicks = max(1,ATTACK_TICKS - enemyAttackTicks*enemyAttackTicks/2);
	if (game.curArenaWorld.lastPlayerWalkTick!=0 &&
		game.ticks-game.curArenaWorld.lastPlayerWalkTick > WALK_TICKS-game.curArenaWorld.playerElementity->stats[STAT_SPEED]) {
		fightGameScreen_movePlayer (game.playerDir);
		game.curArenaWorld.lastPlayerWalkTick = game.ticks;
	}
	if (game.ticks-game.curArenaWorld.lastEnemyWalkTick > WALK_TICKS-game.curArenaWorld.enemyElementity->stats[STAT_SPEED]) {
		fightGameScreen_moveEnemy ();
		game.curArenaWorld.lastEnemyWalkTick = game.ticks;
	}
	if (game.curArenaWorld.isPlayerShooting && game.ticks-game.curArenaWorld.lastPlayerAttackTick > playerAttackTicks &&
		game.curArenaWorld.playerElementity->hp > 0) {
		game.curArenaWorld.lastPlayerAttackTick = game.ticks;
		fightGameScreen_spawnProjectile (ASCII_TRUE);
	}
	if (game.curArenaWorld.isEnemyShooting && game.ticks-game.curArenaWorld.lastEnemyAttackTick > enemyAttackTicks &&
		game.curArenaWorld.enemyElementity->hp > 0) {
		game.curArenaWorld.lastEnemyAttackTick = game.ticks;
		fightGameScreen_spawnProjectile (ASCII_FALSE);
	}
	if (game.curArenaWorld.nextPlayerIndex!=MAX_ELEMENTITIES && game.ticks-game.curArenaWorld.lastPlayerChangeTick > CHANGE_TICKS) {
		if (game.curArenaWorld.nextPlayerIndex != DEATH)
			fightGameScreen_switchPlayerElementity(game.curArenaWorld.nextPlayerIndex);
		else
			switchToScreen(fightLostScreen);
		game.curArenaWorld.nextPlayerIndex = MAX_ELEMENTITIES;
		game.curArenaWorld.lastPlayerChangeTick = 0;
	}
	if (game.curArenaWorld.nextEnemyIndex!=MAX_ELEMENTITIES && game.ticks-game.curArenaWorld.lastEnemyChangeTick > CHANGE_TICKS) {
		if (game.curArenaWorld.nextEnemyIndex != DEATH)
			fightGameScreen_switchEnemyElementity(game.curArenaWorld.nextEnemyIndex);
		else
			switchToScreen (fightWonScreen);
		game.curArenaWorld.nextEnemyIndex = MAX_ELEMENTITIES;
		game.curArenaWorld.lastEnemyChangeTick = 0;
	}
	for (i=0;i<game.curArenaWorld.projectileCount;i++) {
		p = game.curArenaWorld.projectiles + i;
		if (game.ticks-p->lastTick > PROJECTILE_TICKS) {
			p->lastTick = game.ticks;
			switch (p->dir) {
			case(DIR_UP):{p->pos.y--;}break;
			case(DIR_DOWN):{p->pos.y++;}break;
			case(DIR_LEFT):{p->pos.x--;}break;
			case(DIR_RIGHT):{p->pos.x++;}break;
			}
			game.needRedraw = ASCII_TRUE;
			if (p->isPlayer && p->pos.x==game.curArenaWorld.enemyPos.x && p->pos.y==game.curArenaWorld.enemyPos.y) {
				damageElementity(p->source,game.curArenaWorld.enemyElementity);
				game.curArenaWorld.lastEffect = getEffect(game.curArenaWorld.playerElementityInfo->element,game.curArenaWorld.enemyElementityInfo->element);
				if (game.curArenaWorld.enemyElementity->hp == 0) {
					game.curArenaWorld.lastDefeater = game.elementities[p->source->elementityID].name;
					game.curArenaWorld.lastDefeated = game.curArenaWorld.enemyElementityInfo->name;
					game.curArenaWorld.lastDefeatedByPlayer = ASCII_TRUE;
					expGain = getKillExperience(game.curArenaWorld.enemyElementityInfo,game.curArenaWorld.enemyElementity->level);
					game.curArenaWorld.playerExperienceGain[game.curArenaWorld.playerElementityIndex] += expGain;
					game.curArenaWorld.playerMoneyGain += expGain;
					game.playerMoney += expGain;
					for (j=0;j<game.curEnemy->elementityCount;j++) {
						if (game.curEnemy->elementities[j].hp > 0) {
							game.curArenaWorld.nextEnemyIndex = j;
							break;
						}
					}
					if (j >= game.curEnemy->elementityCount)
						game.curArenaWorld.nextEnemyIndex = DEATH;
					game.curArenaWorld.lastEnemyChangeTick = game.ticks;
				}
				fightGameScreen_destroyProjectile (i--);
			}
			else if (!p->isPlayer && p->pos.x==game.curArenaWorld.playerPos.x && p->pos.y==game.curArenaWorld.playerPos.y) {
				damageElementity(p->source,game.curArenaWorld.playerElementity);
				if (game.curArenaWorld.playerElementity->hp == 0) {
					game.curArenaWorld.lastDefeater = game.elementities[p->source->elementityID].name;
					game.curArenaWorld.lastDefeated = game.curArenaWorld.playerElementityInfo->name;
					game.curArenaWorld.lastDefeatedByPlayer = ASCII_FALSE;
					for (j=0;j<game.playerElementityCount;j++) {
						if (game.playerElementities[j].hp > 0) {
							game.curArenaWorld.nextPlayerIndex = j;
							break;
						}
					}
					if (j >= game.playerElementityCount)
						game.curArenaWorld.nextPlayerIndex = DEATH;
					game.curArenaWorld.lastPlayerChangeTick = game.ticks;
				}
				fightGameScreen_destroyProjectile (i--);
			}
			else {
				gameTile = fightGameScreen_getGameTile(p->pos.x,p->pos.y);
				if (gameTile == TILE_SOLID)
					fightGameScreen_destroyProjectile(i--);
			}
		}
	}
	game.ticks++;
}

void fightGameScreen_render (void) {
	const char playerChars[4] = {'^','v','<','>'};
	const char* strNotEffective = "Not effective!";//len: 14
	const char* strVeryEffective = "Very effective!";//len: 15
	const char* strYouDefeated = "Your %s defeated %s!";
	const char* strYoureDefeated = "%s defeated your %s!";
	char buffer [60];
	uint8_t i,j,element,len;
	asciiClearScreen (game.engine);
	asciiFillRect(game.engine,asciiChar(' ',ASCII_COLOR_WHITE,ASCII_COLOR_BLACK),asciiRect(60,0,20,25));
	renderWorld (game.curArenaWorld.world);
	for (i=0;i<game.curArenaWorld.projectileCount;i++) {
		element = game.elementities[game.curArenaWorld.projectiles[i].source->elementityID].element;
		asciiDrawChar (game.engine,asciiChar('o',getElementColor(element),ASCII_COLOR_BLACK),game.curArenaWorld.projectiles[i].pos);
	}
	if (game.curArenaWorld.enemyElementity->hp > 0)
		drawElementity(game.curArenaWorld.enemyElementity,game.curArenaWorld.enemyPos);
	if (game.curArenaWorld.playerElementity->hp > 0)
		asciiDrawChar(game.engine,asciiChar(playerChars[game.playerDir],getElementColor(game.curArenaWorld.playerElementityInfo->element),
			getElementForeColor(game.curArenaWorld.playerElementityInfo->element)),game.curArenaWorld.playerPos);
	if (game.curArenaWorld.lastEffect != HIT_EFFECTIVE)
		asciiDrawText(game.engine,(game.curArenaWorld.lastEffect==HIT_NOT_EFFECTIVE ? strNotEffective : strVeryEffective),
			asciiPoint(60/2-7,0));

	asciiDrawRectangleColored (game.engine,asciiRect(61,1,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	drawElementity(game.curArenaWorld.enemyElementity,asciiPoint(62,2));
	drawElementityName (game.curArenaWorld.enemyElementity,asciiPoint(66,1));
	drawElementityHP (game.curArenaWorld.enemyElementity,asciiPoint(65,2));
	for (i=j=0;i<game.curEnemy->elementityCount;i++) {
		if (i != game.curArenaWorld.enemyElementityIndex) {
			drawElementityName (game.curEnemy->elementities+i,asciiPoint(66,3 + j*2));
			drawElementityHP (game.curEnemy->elementities+i,asciiPoint(65,4 + j*2));
			j++;
		}
	}

	asciiDrawRectangleColored (game.engine,asciiRect(61,21,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	drawElementity(game.curArenaWorld.playerElementity,asciiPoint(62,22));
	drawElementityName (game.curArenaWorld.playerElementity,asciiPoint(66,21));
	drawElementityHP (game.curArenaWorld.playerElementity,asciiPoint(65,22));
	for (i=j=0;i<game.playerElementityCount;i++) {
		if (i != game.curArenaWorld.playerElementityIndex) {
			drawElementityName (game.playerElementities+i,asciiPoint(66,19 - j*2));
			drawElementityHP (game.playerElementities+i,asciiPoint(65,20 - j*2));
			j++;
		}
	}

	if (game.curArenaWorld.lastDefeated) {
		len = sprintf(buffer,(game.curArenaWorld.lastDefeatedByPlayer ? strYouDefeated : strYoureDefeated),
			game.curArenaWorld.lastDefeater,game.curArenaWorld.lastDefeated);
		asciiDrawText(game.engine,buffer,asciiPoint(30-len/2,24));
	}
}
void fightGameScreen_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	uint8_t i;
	if (isDown) {
		switch (key) {
		case(ASCII_KEY_UP):{
			game.playerDir = DIR_UP;
			game.curArenaWorld.lastPlayerWalkTick = game.ticks;
						   }break;
		case(ASCII_KEY_DOWN):{
			game.playerDir = DIR_DOWN;
			game.curArenaWorld.lastPlayerWalkTick = game.ticks;
							 }break;
		case(ASCII_KEY_LEFT):{
			game.playerDir = DIR_LEFT;
			game.curArenaWorld.lastPlayerWalkTick = game.ticks;
							 }break;
		case(ASCII_KEY_RIGHT):{
			game.playerDir = DIR_RIGHT;
			game.curArenaWorld.lastPlayerWalkTick = game.ticks;
							  }break;
		case(ASCII_KEY_SPACE):{
			game.curArenaWorld.playerShootDir = game.playerDir;
			game.curArenaWorld.isPlayerShooting = ASCII_TRUE;
							  }break;
		case(ASCII_KEY_1):
		case(ASCII_KEY_2):
		case(ASCII_KEY_3):
		case(ASCII_KEY_4):
		case(ASCII_KEY_5):{
			i = key-ASCII_KEY_1;
			if (game.playerElementityCount > i && game.playerElementities[i].hp>0 &&
				game.curArenaWorld.nextPlayerIndex != DEATH) {
				if (game.curArenaWorld.lastPlayerChangeTick == 0)
					game.curArenaWorld.lastPlayerChangeTick = game.ticks;
				game.curArenaWorld.nextPlayerIndex = i;
			}
						  }break;
		}
	}
	else {
		switch (key) {
		case(ASCII_KEY_UP):
		case(ASCII_KEY_DOWN):
		case(ASCII_KEY_LEFT):
		case(ASCII_KEY_RIGHT):{
			if (asciiIsKeyPressed(game.engine,ASCII_KEY_UP))
				game.playerDir = DIR_UP;
			else if (asciiIsKeyPressed(game.engine,ASCII_KEY_DOWN))
				game.playerDir = DIR_DOWN;
			else if (asciiIsKeyPressed(game.engine,ASCII_KEY_LEFT))
				game.playerDir = DIR_LEFT;
			else if (asciiIsKeyPressed(game.engine,ASCII_KEY_RIGHT))
				game.playerDir = DIR_RIGHT;
			else
				game.curArenaWorld.lastPlayerWalkTick = 0;
							  }break;
		case(ASCII_KEY_SPACE):{
			game.curArenaWorld.isPlayerShooting = ASCII_FALSE;
							  }break;
		}
	}
}

void fightGameScreen_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void fightGameScreen_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen fightGameScreen = {
	fightGameScreen_init,
	fightGameScreen_update,
	fightGameScreen_render,
	fightGameScreen_keyHandler,
	fightGameScreen_mouseKeyHandler,
	fightGameScreen_mouseMoveHandler
};
