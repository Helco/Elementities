#include "globals.h"

const char* fightLostImageData =
	"+-------------You lost the battle-------------+"
	"|                                             |"
	"| What a sad day, all your elementities died, |"
	"| murdered by strange people in a even        |"
	"| stranger cave...                            |"
	"| But if I was you, I would run as quickly up |"
	"| to the light, where you can maybe find      |"
	"| another life with fresh air and high places |"
	"| to stay, to live, to die...                 |"
	"| ...but that is another story                |"
	"|                                             |"
	"|      Press Enter to go back to the menu     |"
	"|                                             |"
	"+---------------------------------------------+";
asciiBitmap fightLostImage = {
	{{0,0},{47,14}},
	0, //stupid MSVC :(
	0,
	0,
	47
};

void fightLost_init (void) {
	fightLostImage.address = (asciiTextchar*)fightLostImageData;
}

void fightLost_update (void) {
}

void fightLost_render (void) {
	asciiDrawBitmapColored(game.engine,fightLostImage,asciiRect(SCREEN_WIDTH/2-23,SCREEN_HEIGHT/2-7,0,0),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
}

void fightLost_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (!isDown && key==ASCII_KEY_RETURN) {
		freeGame ();
		switchToScreen(mainMenuScreen);
	}
}

void fightLost_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void fightLost_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen fightLostScreen = {
	fightLost_init,
	fightLost_update,
	fightLost_render,
	fightLost_keyHandler,
	fightLost_mouseKeyHandler,
	fightLost_mouseMoveHandler
};
