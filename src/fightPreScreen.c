#include "globals.h"

void fightPre_init (void) {
}

void fightPre_update (void) {
}

void fightPre_render (void) {
	uint8_t i;
	const char* strVersus = "Versus";//len:6
	const char* strPressEnter = "Press Enter to continue.";//len:24
	asciiDrawFilledRectangleColored (game.engine,asciiRect(SCREEN_WIDTH/2-23,0,46,25),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored(game.engine,strVersus,asciiPoint(SCREEN_WIDTH/2-3,SCREEN_HEIGHT/2),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored(game.engine,strPressEnter,asciiPoint(SCREEN_WIDTH/2-12,22),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored(game.engine,"You",asciiPoint(SCREEN_WIDTH/2-12,1),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored(game.engine,"Enemy",asciiPoint(SCREEN_WIDTH/2+8,1),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	for (i=0;i<MAX_ELEMENTITIES;i++) {
		if (i<game.playerElementityCount)
			drawElementitySmallProfile (game.playerElementities+i,asciiPoint(SCREEN_WIDTH/2-18,2+i*4));
		else
			asciiDrawFilledRectangleColored (game.engine,asciiRect(SCREEN_WIDTH/2-18,2+i*4,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
		if (i<game.curEnemy->elementityCount)
			drawElementitySmallProfile (game.curEnemy->elementities+i,asciiPoint(SCREEN_WIDTH/2+5,2+i*4));
		else
			asciiDrawFilledRectangleColored (game.engine,asciiRect(SCREEN_WIDTH/2+5,2+i*4,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	}
}

void fightPre_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (!isDown && key==ASCII_KEY_RETURN)
		switchToScreen (fightGameScreen);
}

void fightPre_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void fightPre_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen fightPreScreen = {
	fightPre_init,
	fightPre_update,
	fightPre_render,
	fightPre_keyHandler,
	fightPre_mouseKeyHandler,
	fightPre_mouseMoveHandler
};
