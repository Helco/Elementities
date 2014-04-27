#include "globals.h"
#include <time.h>

const char* mainMenuLetterData = 
	"+--------------------------------------_xxxxx"
	"| Hi there Adventurer,                  \\xxxx"
	"|                                        \\xxx"
	"| and welcome to The Arena-Cave. Here your\\xx"
	"| guidance and trainer-ability will be     \\x"
	"| tested by many other Adventurers with the |"
	"| same goal as you: Get to the end, where   |"
	"| you and your elementities will be rewared |"
	"| with endless money and fame.              |"
	"| If you think you are tough enough: Here   |"
	"| are your weapons of my choice:            |"
	"|  - Your first Elementity. Be careful, if  |"
	"|    you lose it, you will never win this   |"
	"|  - The Encyclopedia, make sure you read it|"
	"|    carefully, it holds important pieces of|"
	"|    advice on how to not be a piece of shit|"
	"|    not worthy the time it takes to bring  |"
	"|    your dead body to the trash...         |"
	"|                                           |"
	"| Your Boss.                                |"
	"|                                           |"
	"| P.S. Because I had a very good day so far,|"
	"|      I threw in 20 bucks for you as well. |"
	"+-------------------------------------------+";
const char* mainMenuLetterWonData=
	"+--------------------------------------_xxxxx"
	"| Hi there Winner,                      \\xxxx"
	"|                                        \\xxx"
	"| Wow, I never thought I would say this bu\\xx"
	"| CONGRATULATIONS! You made it through the \\x"
	"| whole cave (and even the hell, I did not  |"
	"| actually even planned that). Now I can    |"
	"| tell you the reason for this all: I\'m     |"
	"| going to a place where hundreds of        |"
	"| dangerous Elementities are, just waiting  |"
	"| to kill me and I need someone to fight    |"
	"| them. If you are interested just send me  |"
	"| an e-mail...                              |"
	"| But hey! With going that last ladder down |"
	"| you earned yourself the money and the fame|"
	"| The press is just waiting for interviews  |"
	"| with you and I heard some famous people   |"
	"| talking about some other projects in which|"
	"| they want you to integrate. Anyways be    |"
	"| happy for the rest of your life and keep  |"
	"| your new pets. I think they are good      |"
	"| friends for you now.                      |"
	"|               Your friend.                |"
	"+-------------------------------------------+";
const char* mainMenuControlData =
	"+----------------------------+"
	"|[^][v][<][>] - Movement     |"
	"|[1]-[5] - Switch Elementity |"
	"|[Space] - Fire              |"
	"|[Enter] - Menu              |"
	"|[H] - Open/Close Encylopedia|"
	"+----------------------------+";
asciiBitmap mainMenuLetter = {
	{{0,0},{45,24}},
	0,
	'x',
	0,
	45
};
asciiBitmap mainMenuControl = {
	{{0,0},{30,7}},
	0,
	0,
	0,
	30
};

void mainMenu_init (void) {
	game.state = 0;
	mainMenuControl.address = (asciiTextchar*)mainMenuControlData;
}

void mainMenu_update (void) {
}

void mainMenu_render (void) {
	mainMenuLetter.address = (asciiTextchar*)(game.hasWon ? mainMenuLetterWonData : mainMenuLetterData);
	asciiFillRect(game.engine,asciiChar(' ',ASCII_COLOR_WHITE,ASCII_COLOR_BLACK),asciiRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT));
	asciiDrawBitmapColored (game.engine,mainMenuLetter,asciiRect(0,0,0,0),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawBitmapColored (game.engine,mainMenuControl,asciiRect((SCREEN_WIDTH-45)/2+30,SCREEN_HEIGHT/4,0,0),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawTextColored (game.engine,"[Press Enter to start]",asciiPoint((SCREEN_WIDTH-45)/2+34,SCREEN_HEIGHT/4*3),
		ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
}

void mainMenu_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (!isDown && key==ASCII_KEY_RETURN) {
		initGame ((uint32_t)time(0));
		switchToScreen(overGameScreen);
	}
}

void mainMenu_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void mainMenu_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen mainMenuScreen = {
	mainMenu_init,
	mainMenu_update,
	mainMenu_render,
	mainMenu_keyHandler,
	mainMenu_mouseKeyHandler,
	mainMenu_mouseMoveHandler
};
