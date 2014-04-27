#include "globals.h"

void shop_init (void) {
	uint8_t i;
	game.state = 0;
	memset(game.curOverWorld->shopPrices,0,sizeof(uint32_t)*11);
	for (i=0;i<game.playerElementityCount;i++) {
		game.curOverWorld->shopPrices[i+1] = game.playerElementities[i].stats[STAT_MAX_HP]-game.playerElementities[i].hp;
		game.curOverWorld->shopPrices[0] += game.curOverWorld->shopPrices[i+1];
	}
	for (i=0;i<game.curOverWorld->shopElementityCount;i++)
		game.curOverWorld->shopPrices[i+6] = game.curOverWorld->shopElementities[i].experience;
}

void shop_update (void) {
}

void shop_render (void) {
	const asciiColor bg[2]={ASCII_COLOR_WHITE,ASCII_COLOR_BLACK};
	const asciiColor fg[2]={ASCII_COLOR_BLACK,ASCII_COLOR_WHITE};
	const char* strLeave = "[Leave shop]";//Len:12
	uint8_t i,len;
	char buffer[30];
	asciiDrawFilledRectangleColored(game.engine,asciiRect(SCREEN_WIDTH/2-22,0,44,25),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	len = sprintf(buffer,"Shop - %u$",game.playerMoney);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(SCREEN_WIDTH/2-len/2,0),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	sprintf(buffer,"[Heal all %u$]",game.curOverWorld->shopPrices[0]);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(SCREEN_WIDTH/2-19,1),bg[game.state==0],fg[game.state==0]);
	asciiDrawTextColored(game.engine,strLeave,asciiPoint(SCREEN_WIDTH/2-6,22),bg[game.state==11],fg[game.state==11]);
	for (i=0;i<MAX_ELEMENTITIES;i++) {
		if (i<game.playerElementityCount)
			drawElementityHPProfile (game.playerElementities+i,asciiPoint(SCREEN_WIDTH/2-19,2+i*4));
		else
			asciiDrawFilledRectangleColored(game.engine,asciiRect(SCREEN_WIDTH/2-19,2+i*4,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
		sprintf(buffer,"[Heal %u$]",game.curOverWorld->shopPrices[i+1]);
		asciiDrawTextColored(game.engine,buffer,asciiPoint(SCREEN_WIDTH/2-15,4+i*4),bg[game.state == i+1],fg[game.state == i+1]);

		if (i<game.curOverWorld->shopElementityCount)
			drawElementitySmallProfile (game.curOverWorld->shopElementities+i,asciiPoint(SCREEN_WIDTH/2+3,2+i*4));
		else
			asciiDrawFilledRectangleColored(game.engine,asciiRect(SCREEN_WIDTH/2+3,2+i*4,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
		sprintf(buffer,"[Buy %u$]",game.curOverWorld->shopPrices[i+6]);
		asciiDrawTextColored(game.engine,buffer,asciiPoint(SCREEN_WIDTH/2+7,4+i*4),bg[game.state == i+6],fg[game.state == i+6]);
	}
}

void shop_keyHandler (asciiKey key,asciiBool isDown,void* context) {
	uint8_t i;
	if (!isDown) {
		switch (key) {
		case(ASCII_KEY_UP):{
			if (game.state==0)
				game.state = 11;
			else
				game.state--;
			game.needRedraw = ASCII_TRUE;
						   }break;
		case(ASCII_KEY_DOWN):{
			game.state = (game.state + 1)%12;
			game.needRedraw = ASCII_TRUE;
							 }break;
		case(ASCII_KEY_RETURN):{
			switch(game.state){
			case(0):{
				if (game.playerMoney >= game.curOverWorld->shopPrices[0]) {
					game.playerMoney -= game.curOverWorld->shopPrices[0];
					for (i=0;i<game.playerElementityCount;i++)
						game.playerElementities[i].hp = game.playerElementities[i].stats[STAT_MAX_HP];
					for (i=0;i<6;i++)
						game.curOverWorld->shopPrices[i] = 0;
				}
					}break;
			case(11):{switchToScreen(overGameScreen);}break;
			case(1):
			case(2):
			case(3):
			case(4):
			case(5):{
				i = game.state-1;
				if (i < game.playerElementityCount && game.playerMoney>=game.curOverWorld->shopPrices[game.state]) {
					game.playerMoney -= game.curOverWorld->shopPrices[game.state];
					game.playerElementities[i].hp = game.playerElementities[i].stats[STAT_MAX_HP];
					game.curOverWorld->shopPrices[0] -= game.curOverWorld->shopPrices[game.state];
					game.curOverWorld->shopPrices[game.state] = 0;
				}
					}break;
			case(6):
			case(7):
			case(8):
			case(9):
			case(10):{
				i = game.state-6;
				if (i < game.curOverWorld->shopElementityCount && game.playerMoney>=game.curOverWorld->shopPrices[game.state] &&
					game.playerElementityCount<MAX_ELEMENTITIES) {
					game.playerMoney -= game.curOverWorld->shopPrices[game.state];
					game.playerElementities[game.playerElementityCount++] = game.curOverWorld->shopElementities[i];
					if (i+1 != game.curOverWorld->shopElementityCount) {
						memmove(game.curOverWorld->shopElementities+i,game.curOverWorld->shopElementities+i+1,
							sizeof(Elementity)*(game.curOverWorld->shopElementityCount-i-1));
						memmove(game.curOverWorld->shopPrices+i,game.curOverWorld->shopPrices+i+1,
							sizeof(uint32_t)*(game.curOverWorld->shopElementityCount-i-1));
						game.curOverWorld->shopPrices[game.curOverWorld->shopElementityCount-1] = 0;
					}
					game.curOverWorld->shopElementityCount--;
				}
					 }break;
			}
			game.needRedraw = ASCII_TRUE;
							   }break;
		}
	}
}

void shop_mouseKeyHandler (asciiMouseKey key,asciiBool isDown,void* context) {
}

void shop_mouseMoveHandler (asciiPoint mousePos,void* context) {
}

Screen shopScreen = {
	shop_init,
	shop_update,
	shop_render,
	shop_keyHandler,
	shop_mouseKeyHandler,
	shop_mouseMoveHandler
};
