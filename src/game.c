#include "globals.h"

struct _Game game={0};

void initGame (uint32_t seed) {
	asciiEngine* tmp = game.engine;
	memset(&game,0,sizeof(struct _Game));
	game.engine = tmp;
	game.generatedOverWorlds = 0;
	game.baseSeed = seed;
	generateElementities ();
	game.playerElementityCount = 1;
	game.playerMoney = 20;
	game.playerElementities[0] = game.elementities[rand()%ELEMENTITIES_COUNT].startObject;
	game.playerElementities[0].experience = game.playerElementities[0].nextLevel;
	levelUpElementity(game.playerElementities);
	goToLevel (0);
}

void freeGame () {
	uint8_t i;
	freeArenaWorld (game.curArenaWorld);
	for (i=0;i<game.generatedOverWorlds;i++)
		freeOverWorld (game.overWorlds[i]);
}
struct _LevelGenData {
	const char* name;
	asciiColor backColor,
		foreColor;
	int32_t minRooms;
	int32_t maxRooms;
	uint8_t enemySight;
} levelGenData [LEVEL_COUNT]={
	{"Grass-Cave I",ASCII_COLOR_GREEN,ASCII_COLOR_BLACK,4,6,4},
	{"Grass-Cave II",ASCII_COLOR_GREEN,ASCII_COLOR_BLACK,5,7,4},
	{"Cave I",ASCII_COLOR_WHITE,ASCII_COLOR_BLACK,7,8,5},
	{"Cave II",ASCII_COLOR_WHITE,ASCII_COLOR_BLACK,8,9,5},
	{"Depth I",ASCII_COLOR_BLACK,ASCII_COLOR_WHITE,10,11,6},
	{"Depth II",ASCII_COLOR_BLACK,ASCII_COLOR_WHITE,11,12,6},
	{"Hell I",ASCII_COLOR_RED,ASCII_COLOR_BLACK,13,14,6},
	{"Hell II",ASCII_COLOR_RED,ASCII_COLOR_BLACK,14,15,6}
};
void goToLevel (uint8_t levelID) {
	uint8_t i;
	for (i=0;i<=levelID;i++) {
		if (game.generatedOverWorlds <= i)
			game.overWorlds[i] = generateWorld (game.baseSeed+i*234,
				i,levelGenData[i].name,
				levelGenData[i].backColor,levelGenData[i].foreColor,
				levelGenData[i].minRooms,levelGenData[i].maxRooms,
				levelGenData[i].enemySight);
	}
	if (levelID+1 >= game.generatedOverWorlds)
		game.generatedOverWorlds = levelID+1;
	game.curOverWorld = game.overWorlds + levelID;
	game.curLevelID = levelID;
	game.needRedraw = ASCII_TRUE;
}
void generateName (char* name) {
	const char* v="aeiou";
	const char* c="bcdfghjklmnpqrstvwxyz";
	const char* r="cjxyzq";
	uint8_t i,j,len = MIN_NAME_LEN+(rand()%(MAX_NAME_LEN-MIN_NAME_LEN+1));
	asciiBool lastConsonant = ASCII_FALSE;
	for (i=0;i<len;i++) {
		if (lastConsonant ? (rand()%10 > 0) : (rand()%15 == 0)) {
			name[i] = v[rand()%5];
			lastConsonant = ASCII_FALSE;
		}
		else {
			name[i] = c[rand()%21];
			if (rand()%4 > 0) {
				for (j=0;j<5;j++)
					if (name[i]==r[j])
						i--;
				if (j==5)
					lastConsonant = ASCII_TRUE;
			}
			else
				lastConsonant = ASCII_TRUE;
		}
	}
	name[len]=0;
	name[0] = toupper(name[0]);
}

struct _ElementityStatRange {
	uint8_t minStat,maxStat;
};
const struct _ElementityStatRange elementityStatRanges [STAT_COUNT] = {
	{1,4},{1,4},{1,4},{1,4},{1,3},{5,10}
};
uint32_t getNextLevelExperience (ElementityInfo* info,uint8_t level) {
	return (uint32_t)(20+(level*level+level)*info->value*0.7);
}
uint32_t getKillExperience (ElementityInfo* info,uint8_t level) {
	return (uint32_t)(getNextLevelExperience(info,level)*0.3f);
}
void levelUpElementity (Elementity* e) {
	uint8_t i,range,minStat;
	ElementityInfo* info = game.elementities + e->elementityID;
	e->level++;
	for (i=0;i<STAT_COUNT;i++) {
		minStat = elementityStatRanges[i].minStat;
		range = elementityStatRanges[i].maxStat-minStat+1;
		e->stats[i] = minStat + info->statsValue[i]*range*e->level*0.4f;
	}
	e->hp = e->stats[STAT_MAX_HP];
	e->nextLevel = getNextLevelExperience (info,e->level+1);
}
ElementityInfo generateElementity (uint8_t id,uint8_t element) {
	ElementityInfo info;
	float stats[STAT_COUNT];
	uint8_t i,changes,change,stat1,stat2,newStat1,newStat2,minStat,range;
	generateName (info.name);
	info.character = (rand()%2?'a':'A')+(rand()%26);
	info.element = element;
	for (i=0;i<STAT_COUNT;i++)
		stats[i] = elementityStatRanges[i].minStat + (elementityStatRanges[i].maxStat-elementityStatRanges[i].minStat+1)/2;
	changes = rand()%10;
	for (i=0;i<changes;i++) {
		change = rand()%3>0 ? 20 : 30;
		stat1 = rand()%STAT_COUNT;
		stat2 = (stat1 + 1 + rand()%(STAT_COUNT-1)) % STAT_COUNT;
		newStat1 = stats[stat1] + stats[stat1]*(change/100.0f);
		newStat2 = stats[stat2] - stats[stat2]*(change/100.0f);
		if (newStat1 <= elementityStatRanges[stat1].maxStat && 
			newStat2 >= elementityStatRanges[stat2].minStat) {
				stats[stat1] = newStat1;
				stats[stat2] = newStat2;
		}
	}
	info.value = 0.0f;
	for (i=0;i<STAT_COUNT;i++) {
		info.startObject.stats[i] = (uint8_t)stats[i];

		minStat = elementityStatRanges[i].minStat;
		range = elementityStatRanges[i].maxStat-minStat+1;
		info.statsValue[i] = ((float)info.startObject.stats[i]-minStat) / (float)range;
		info.value += info.statsValue[i];
	}
	info.startObject.elementityID = id;
	info.startObject.experience = 0;
	info.startObject.hp = info.startObject.stats[STAT_MAX_HP];
	info.startObject.level = 0-1;
	info.startObject.lastAttackTicks = 0;
	levelUpElementity(&info.startObject);
	return info;
}
void generateElementities () {
	uint8_t i;
	for (i=0;i<ELEMENTITIES_COUNT;i++)
		game.elementities[i] = generateElementity(i,i/ELEMENTITIES_PER_ELEMENT);
}
uint8_t getEffect (uint8_t attackElement,uint8_t victimElement) {
	const char elementTable[ELEMENT_COUNT*ELEMENT_COUNT+1]=
		"#Y#NNY"
		"N#Y#Y#"
		"#N#N#Y"
		"Y#Y#NN"
		"YN#Y#Y"
		"N#NYN#";
	switch (elementTable[attackElement*ELEMENT_COUNT + victimElement]) {
	case('N'):{return HIT_NOT_EFFECTIVE;}break;
	case('#'):{return HIT_EFFECTIVE;}break;
	case('Y'):{return HIT_VERY_EFFECTIVE;}break;
	default:{return HIT_NOT_EFFECTIVE;}break;
	}
}
void damageElementity (Elementity* attacker,Elementity* victim) {
	float damage = attacker->stats[STAT_ATTACK]+(rand()%max(1,attacker->stats[STAT_ATTACK_RANGE]));
	uint8_t effect = getEffect(game.elementities[attacker->elementityID].element,game.elementities[victim->elementityID].element),
		iDamage;
	damage -= victim->stats[STAT_DEFENSE]/2.0f;
	if (effect == HIT_NOT_EFFECTIVE)
		damage *= 0.5f;
	else if (effect == HIT_VERY_EFFECTIVE)
		damage *= 1.5f;
	iDamage = (uint8_t)damage;
	if (damage-(float)iDamage >= 0.5f)
		iDamage++;
	if (iDamage == 0)
		iDamage = 1; //be fair...
	if (iDamage > victim->hp)
		victim->hp = 0;
	else 
		victim->hp -= iDamage;
}
asciiColor getElementColor (uint8_t element) {
	const asciiColor colors[ELEMENT_COUNT]={
		ASCII_COLOR_GREEN,
		ASCII_COLOR_BLUE,
		ASCII_COLOR_YELLOW,
		ASCII_COLOR_MAGENTA,
		ASCII_COLOR_RED,
		ASCII_COLOR_BLACK
	};
	return colors[element];
}
asciiColor getElementForeColor (uint8_t element) {
	const asciiColor colors[ELEMENT_COUNT]={
		ASCII_COLOR_BLACK,
		ASCII_COLOR_BLACK,
		ASCII_COLOR_BLACK,
		ASCII_COLOR_BLACK,
		ASCII_COLOR_BLACK,
		ASCII_COLOR_WHITE
	};
	return colors[element];
}
void drawElementity (Elementity* e,asciiPoint pos) {
	ElementityInfo* info = game.elementities + e->elementityID;
	asciiDrawChar(game.engine,asciiChar(info->character,getElementColor(info->element),getElementForeColor(info->element)),pos);
}
void drawElementityHP (Elementity* e,asciiPoint pos) {
	const asciiColor c[2] = {ASCII_COLOR_WHITE,ASCII_COLOR_RED};
	char buffer[10] = "(   /   )";
	uint8_t i,chars,
		hp = e->hp,
		maxHP = e->stats[STAT_MAX_HP];
	buffer[1] = '0' + hp/100%10;
	buffer[2] = '0' + hp/10%10;
	buffer[3] = '0' + hp%10;
	buffer[5] = '0' + maxHP/100%10;
	buffer[6] = '0' + maxHP/10%10;
	buffer[7] = '0' + maxHP%10;
	if (buffer[1]=='0') {
		buffer[1] = ' ';
		if (buffer[2]=='0')
			buffer[2] = ' ';
	}
	if (buffer[5]=='0') {
		buffer[5] = ' ';
		if (buffer[6]=='0')
			buffer[6] = ' ';
	}
	chars = (uint8_t)(((float)hp)/maxHP*9.0f);
	for (i=0;i<9;i++)
		asciiDrawChar(game.engine,asciiChar(buffer[i],c[i<chars],ASCII_COLOR_BLACK),asciiPoint(pos.x+i,pos.y));
}
void drawElementityName (Elementity* e,asciiPoint pos) {
	ElementityInfo* info = game.elementities + e->elementityID;
	uint32_t len = strlen(info->name);
	asciiDrawTextColored(game.engine,info->name,asciiPoint(pos.x + 8-len,pos.y),
		getElementColor(info->element),getElementForeColor(info->element));
}
void drawElementityProfile (Elementity* e,asciiPoint pos) {
	char buffer[32];
	asciiDrawRectangleColored(game.engine,asciiRect(pos.x,pos.y,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	drawElementity(e,asciiPoint(pos.x+1,pos.y+1));
	drawElementityName (e,asciiPoint(pos.x+5,pos.y));
	drawElementityHP (e,asciiPoint(pos.x+14,pos.y));
	sprintf(buffer,"Lv:%hhu - %hhu/%hhu",e->level,e->experience,e->nextLevel);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(pos.x+5,pos.y+1),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	sprintf(buffer,"ATT:%hhu-%hhu(%hhu) DEF:%hhu SPEED:%hhu",e->stats[STAT_ATTACK],e->stats[STAT_ATTACK]+e->stats[STAT_ATTACK_RANGE],
		e->stats[STAT_ATTACK_FREQUENCE],e->stats[STAT_DEFENSE],e->stats[STAT_SPEED]);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(pos.x+5,pos.y+2),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
}
void drawElementitySmallProfile (Elementity* e,asciiPoint pos) {
	char buffer[8];
	asciiDrawRectangleColored(game.engine,asciiRect(pos.x,pos.y,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	drawElementity(e,asciiPoint(pos.x+1,pos.y+1));
	drawElementityName (e,asciiPoint(pos.x+5,pos.y));
	sprintf(buffer,"Lv:%hhu",e->level,e->experience,e->nextLevel);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(pos.x+5,pos.y+1),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
}
void drawElementityHPProfile (Elementity* e,asciiPoint pos) {
	asciiDrawRectangleColored(game.engine,asciiRect(pos.x,pos.y,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	drawElementity(e,asciiPoint(pos.x+1,pos.y+1));
	drawElementityName (e,asciiPoint(pos.x+5,pos.y));
	drawElementityHP (e,asciiPoint(pos.x+5,pos.y+1));
}
void drawElementityBasicProfile (Elementity* e,asciiPoint pos) {
	char buffer[32];
	asciiDrawRectangleColored(game.engine,asciiRect(pos.x,pos.y,3,3),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
	drawElementity(e,asciiPoint(pos.x+1,pos.y+1));
	drawElementityName (e,asciiPoint(pos.x+5,pos.y));
	drawElementityHP (e,asciiPoint(pos.x+5,pos.y+1));
	sprintf(buffer,"Lv:%hhu %hhu/%hhu",e->level,e->experience,e->nextLevel);
	asciiDrawTextColored(game.engine,buffer,asciiPoint(pos.x+5,pos.y+2),ASCII_COLOR_WHITE,ASCII_COLOR_BLACK);
}
