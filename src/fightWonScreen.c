#include "globals.h"

#define START_TICKS 90
#define EXP_TICKS 2
#define LEVEL_TICKS 45

void fightWon_init (void) {
	game.curArenaWorld.playerElementityIndex = 0;
	game.ticks = START_TICKS;
	game.state = 0;
}

void fightWon_update (void) {
	switch (game.state) {
	case(0):{//Wait START_TICKS ticks
		if (game.ticks==0) 
			game.state = 1;//add experience points
		else
			game.ticks--;
			}break;
	case(1):{//add experience points
		if (game.ticks==0) {
			game.ticks = EXP_TICKS;
			if (game.curArenaWorld.playerExperienceGain[game.curArenaWorld.playerElementityIndex]==0) {
				game.curArenaWorld.playerElementityIndex++;
				if (game.curArenaWorld.playerElementityIndex >= game.playerElementityCount)
					game.state = 0xff; //do nothing anymore
				else {
					game.state = 0;//wait START_TICKS ticks
					game.ticks = START_TICKS;
				}
			}
			else {
				game.curArenaWorld.playerExperienceGain[game.curArenaWorld.playerElementityIndex]--;
				game.playerElementities[game.curArenaWorld.playerElementityIndex].experience++;
				if (game.playerElementities[game.curArenaWorld.playerElementityIndex].experience == 
					game.playerElementities[game.curArenaWorld.playerElementityIndex].nextLevel) {
					levelUpElementity(game.playerElementities+game.curArenaWorld.playerElementityIndex);
					game.state = 2;//wait LEVEL_TICKS ticks
					game.ticks = LEVEL_TICKS;
				}
			}
			game.needRedraw = ASCII_TRUE;
		}
		else
			game.ticks--;
			}break;
	case(2):{//wait LEVEL_TICKS ticks
		if (game.ticks==0)
			game.state = 1;//add experience points
		else
			game.ticks--;
			}break;
	}
}

void fightWon_render (void) {
	const char* strYouWon = "You won the battle!";//len:19
	const char* strPressEnter = "Press Enter to continue.";//len:24
	char buffer[32];
	uint8_t i;
	asciiDrawRectangle(game.engine,asciiRect(SCREEN_WIDTH/2-19,0,38,25));
	asciiFillRect(game.engine,asciiChar(' ',ASCII_COLOR_WHITE,ASCII_COLOR_BLACK),asciiRect(SCREEN_WIDTH/2-18,1,36,23));
	asciiDrawText(game.engine,strYouWon,asciiPoint(SCREEN_WIDTH/2-9,0));
	asciiDrawText(game.engine,strPressEnter,asciiPoint(SCREEN_WIDTH/2-12,22));
	sprintf(buffer,"You got %u$. Now you have %u$",game.curArenaWorld.playerMoneyGain,game.playerMoney);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(SCREEN_WIDTH/2-17,1),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	i = game.curArenaWorld.playerElementityIndex;
	if (i < game.playerElementityCount) {
		asciiDrawChar(game.engine,asciiChar('>',ASCII_COLOR_WHITE,ASCII_COLOR_BLACK),asciiPoint(SCREEN_WIDTH/2-17,3+i*4));
		asciiDrawChar(game.engine,asciiChar('<',ASCII_COLOR_WHITE,ASCII_COLOR_BLACK),asciiPoint(SCREEN_WIDTH/2+17,3+i*4));
	}
	for (i=0;i<MAX_ELEMENTITIES;i++) {
		if (i < game.playerElementityCount)
			drawElementityProfile(game.playerElementities+i,asciiPoint(SCREEN_WIDTH/2-16,2+i*4));
		else
			asciiDrawFilledRectangleColored(game.engine,asciiRect(SCREEN_WIDTH/2-16,2+i*4,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	}
}

void fightWon_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (game.state == 0xff && !isDown && key==ASCII_KEY_RETURN) {
		game.curEnemy = 0;
		switchToScreen(overGameScreen);
	}
}

void fightWon_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void fightWon_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen fightWonScreen = {
	fightWon_init,
	fightWon_update,
	fightWon_render,
	fightWon_keyHandler,
	fightWon_mouseKeyHandler,
	fightWon_mouseMoveHandler
};
