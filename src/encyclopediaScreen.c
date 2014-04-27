#include "globals.h"

#define PAGE_COUNT 6
#define PAGE_WIDTH 40
#define PAGE_HEIGHT 20
const char encyclopediaPages [PAGE_COUNT][PAGE_WIDTH*PAGE_HEIGHT+1]={
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"	            Encyclopedia             "
	"                                        "
	"        Get your knowledge here!        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        ",
	"           About Elementities           "
	"                                        "
	"Elementities are small creatures, which "
	"you can use to fight against other      "
	"Elementity trainers. As the name might  "
	"imply, all Elementities have a element  "
	"which they belong to. There are Nature, "
	"Water, Light, Stone, Fire and Darkness- "
	"Elementities, which may have special    "
	"attack effects on Elementities from     "
	"another element (see (2)Effect Table).  "
	"Besides that every Element has stats    "
	"which get better if you level up.       "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        ",
	"             Effect-Table               "
	"                                        "
	"N: not effective  Y: very effective     "
	"                                        "
	"+--------+---+---+---+---+---+---+      "
	"|vAttackv| N | W | L | S | F | D |      "
	"+========+===+===+===+===+===+===+      "
	"| Nature |   | Y |   | N | N | Y |      "
	"+--------+---+---+---+---+---+---+      "
	"| Water  | N |   | Y |   | Y |   |      "
	"+--------+---+---+---+---+---+---+      "
	"| Light  |   | N |   | N |   | Y |      "
	"+--------+---+---+---+---+---+---+      "
	"| Stone  | Y |   | Y |   | N | N |      "
	"+--------+---+---+---+---+---+---+      "
	"| Fire   | Y | N |   | Y |   | Y |      "
	"+--------+---+---+---+---+---+---+      "
	"|Darkness| N |   | N | Y | N |   |      "
	"+--------+---+---+---+---+---+---+      "
	"                                        ",
	"            About the World             "
	"                                        "
	"In the world you'll find these things:  "
	" @ - This is you(green) or another      "
	"     trainer(red)... equally disgusting "
	" H - This is a ladder to the next       "
	"     higher level, but dare to go out   "
	"     of this cave.                      "
	" O - This is a trapdoor to the next     "
	"     deeper level. Your everytime goal  "
	" $ - Near the ladder you will always    "
	"     have a shop (see(3)About the shop) "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        ",
	"            About the shop              "
	"                                        "
	"In the shop you can heal your           "
	"Elementities or buy additional ones.    "
	"You can gain money for paying stuff by  "
	"compete against other trainers.         "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        ",
	"            About fighting              "
	"                                        "
	"Shoot your enemy while don't get shot   "
	"by the enemy. With [1]-[5] you can      "
	"switch between your Elementities.       "
	"With [Space] you can shoot, but if you  "
	"hold [Space] down you always shoot in   "
	"the direction you faced when pressing   "
	"the [Space] button down. So you can     "
	"avoid projectiles and shoot in the      "
	"right direction at one time.            "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
	"                                        "
};

void encyclopedia_init (void) {
}

void encyclopedia_update (void) {
}

void encyclopedia_render (void) {
	char buffer[32];
	uint8_t len;
	asciiBitmap bm = {
		{{0,0},{PAGE_WIDTH,PAGE_HEIGHT}},
		(asciiTextchar*)encyclopediaPages[game.currentPage],
		0,
		0,
		PAGE_WIDTH
	};
	asciiDrawFilledRectangleColored (game.engine,asciiRect(SCREEN_WIDTH/2-PAGE_WIDTH/2-2,SCREEN_HEIGHT/2-PAGE_HEIGHT/2-1,PAGE_WIDTH+3,PAGE_HEIGHT+2),
		ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	len = sprintf(buffer,"Encyclopedia [%hhu/%hhu]",game.currentPage,(uint8_t)PAGE_COUNT-1);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(SCREEN_WIDTH/2-len/2,SCREEN_HEIGHT/2-PAGE_HEIGHT/2-1),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	asciiDrawBitmapColored(game.engine,bm,asciiRect(SCREEN_WIDTH/2-PAGE_WIDTH/2,SCREEN_HEIGHT/2-PAGE_HEIGHT/2,0,0),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
}

void encyclopedia_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	if (!isDown) {
		switch(key) {
		case(ASCII_KEY_UP):
		case(ASCII_KEY_LEFT):{
			if (game.currentPage==0)
				game.currentPage = PAGE_COUNT-1;
			else
				game.currentPage--;
			game.needRedraw = ASCII_TRUE;
							 }break;
		case(ASCII_KEY_DOWN):
		case(ASCII_KEY_RIGHT):{
			game.currentPage = (game.currentPage+1)%PAGE_COUNT;
			game.needRedraw = ASCII_TRUE;
							  }break;
		}
	}
}

void encyclopedia_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void encyclopedia_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen encyclopediaScreen = {
	encyclopedia_init,
	encyclopedia_update,
	encyclopedia_render,
	encyclopedia_keyHandler,
	encyclopedia_mouseKeyHandler,
	encyclopedia_mouseMoveHandler
};