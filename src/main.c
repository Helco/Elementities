#include "globals.h"

static unsigned long int next = 1;

int getRandom (void) // RAND_MAX assumed to be 32767
{
    next = next * 1103515245 + 12345;
    return (unsigned int)(next/65536) % 32768;
}

void initRandom(unsigned int seed)
{
    next = seed;
}
void switchToScreen (Screen screen) {
	game.needRedraw = ASCII_TRUE;
	screen.init ();
	game.lastScreen = game.currentScreen;
	game.currentScreen = screen;
}
void switchToLastScreen () {
	switchToScreen (game.lastScreen);
}
void showMessageBox (const char* title,const char* text) {
	game.messageTitle = title;
	game.messageText = text;
	switchToScreen (messageBoxScreen);
}

void asciiClearScreen (asciiEngine* e) {
	asciiPoint size = asciiGetTargetSize(e);
	asciiClearRect(e,asciiRect(0,0,size.x,size.y));
}
asciiBool asciiRectCollides (asciiRect r1,asciiRect r2) {
	return (r1.offset.x+r1.size.x > r2.offset.x && 
		r1.offset.x < r2.offset.x+r2.size.x && 
		r1.offset.y+r1.size.y > r2.offset.y &&
		r1.offset.y < r2.offset.y+r2.size.y);
}
asciiBool asciiRectFullyContains (asciiRect r1,asciiRect r2) {
	return (r1.offset.x <= r2.offset.x &&
		r1.offset.x+r1.size.x >= r2.offset.x+r2.size.x &&
		r1.offset.y <= r2.offset.y && 
		r1.offset.y+r1.size.y >= r2.offset.y+r2.size.y);
}

void keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (!isDown && key==ASCII_KEY_H) {
		if (game.currentScreen.render == encyclopediaScreen.render)
			switchToLastScreen ();
		else
			switchToScreen(encyclopediaScreen);
	}
	else
		game.currentScreen.keyHandler(key,isDown,context);
}

void mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
	game.currentScreen.mouseKeyHandler(key,isDown,context);
}

void mouseMoveHandler (asciiPoint mousePos,void* context) {
	game.currentScreen.mouseMoveHandler(mousePos,context);
}

void quitHandler (void* context) {
	freeGame ();
}

void tickHandler (void* context) {
	if (game.needRedraw) {
		game.needRedraw = ASCII_FALSE;
		game.currentScreen.render ();
		asciiFlip (game.engine);
	}
	game.currentScreen.update ();
	asciiSetTimeout (game.engine,15,tickHandler,0);
}

int main (int argc,char* argv[]) {
	game.engine = asciiInit (ASCII_GRAPHIC_DEFAULT,SCREEN_WIDTH,SCREEN_HEIGHT);
	if (game.engine) {
		asciiSetKeyEventCallback (game.engine,keyHandler,0);
		asciiSetMouseKeyEventCallback (game.engine,mouseKeyHandler,0);
		asciiSetMouseMoveEventCallback (game.engine,mouseMoveHandler,0);
		asciiSetQuitCallback (game.engine,quitHandler,0);
		asciiToggle (game.engine,ASCII_KEY_REPEAT,ASCII_FALSE);
		switchToScreen (mainMenuScreen);
		tickHandler(0);
		asciiRun (game.engine);
	}
}