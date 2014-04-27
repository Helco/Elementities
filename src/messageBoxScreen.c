#include "globals.h"

void messageBox_init (void) {
}

void messageBox_update (void) {
}

void messageBox_render (void) {
	const char* strPressEnter = "Press Enter to continue.";//len:24
	uint32_t titleLen = strlen(game.messageTitle),
		textLen = strlen(game.messageText),
		width = max(titleLen,textLen);
	width = max(width,24);
	width += 4;
	asciiDrawFilledRectangleColored(game.engine,asciiRect(SCREEN_WIDTH/2-width/2,SCREEN_HEIGHT/2-3,width,6),
		ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored(game.engine,game.messageTitle,asciiPoint(SCREEN_WIDTH/2-titleLen/2,SCREEN_HEIGHT/2-3),
		ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored(game.engine,game.messageText,asciiPoint(SCREEN_WIDTH/2-textLen/2,SCREEN_HEIGHT/2-1),
		ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored(game.engine,strPressEnter,asciiPoint(SCREEN_WIDTH/2-12,SCREEN_HEIGHT/2+1),
		ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
}

void messageBox_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (!isDown && key==ASCII_KEY_RETURN)
		switchToLastScreen ();
}

void messageBox_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void messageBox_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen messageBoxScreen = {
	messageBox_init,
	messageBox_update,
	messageBox_render,
	messageBox_keyHandler,
	messageBox_mouseKeyHandler,
	messageBox_mouseMoveHandler
};
