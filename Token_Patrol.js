
(() => {

	// #Region Vars

	//Const
	const TOKEN_PATROL_MACRO_NAMES = [
		"API-TokPat-Menu",
	];

	//msg
	var msgArgs;

	//Tokens
	var selectedToken;
	var patrollingTokens = [];
	var moveLeft = 0;
	var moveTop = 0;

	// Token Speed
	var patrolSpeed = 1000;

	//data
	var hasEndPoint = false;
	var intervalID = 0;
	var moveCounter = 0;

	//logging
	var chatLogging = false;
	var showPath = false;
	var pathIds = [];


	var playerPageId;

	// #EndRegion Vars

	on("ready", function(){
		hasTokenPatrolMacros();
	})

	// main
	on("chat:message", function(msg){
		
		if(msg.type !== "api"){ return; }
		
		msgArgs = msg.content.split(" ");
		
		if(msgArgs[0] !== "!tokPat") { return; }
		
		if(msgArgs[0] === "!tokPat"){
			if(msgArgs[1] === "--setPosition"){
				stopPatrol();
				getTokens(msg);
			}
			if(msgArgs[1] === "--setEndPosition"){
				stopPatrol();
				hasEndPoint = true;
				getTokens(msg);
			}
			if(msgArgs[1] === "--startPatrol"){
				startPatrol();
			}
			if(msgArgs[1] === "--stopPatrol"){
				stopPatrol();
			}
			if(msgArgs[1] === "--savePatrol"){
				savePatrol();
			}
			if(msgArgs[1] === "--loadPatrol"){
				loadPatrol();
			}
			if(msgArgs[1] === "--clearPatrol"){			
				stopPatrol();
				clearVars();
			}
			if(msgArgs[1] === "--setPatrolSpeed"){
				if(msgArgs[2] !== ""){
					checkTokenPatrolSpeed(msgArgs[2])
				}
			}
			if(msgArgs[1] === "--toggleLogging"){
				toggleLogging();
			}
			if(msgArgs[1] === "--menu"){
				showmenu();
			}
			if(msgArgs[1] === "--togglePatrolPath"){
				showPath = !showPath;
				togglePatrolPaths();
			}		
		}
		//log(patrollingTokens)
	})

	// Shows a menu for the use.
	function showmenu(){	
		let desc = "";
		desc += "Token Patrol menu \n \n";
		desc += "[Set Position](!tokPat --setPosition) \n";
		desc += "[Set End Position](!tokPat --setEndPosition) \n \n \n";
		
		desc += "[Start Patrolling](!tokPat --startPatrol) \n";
		desc += "[Stop Patrolling](!tokPat --stopPatrol) \n \n";
		
		desc += "[Set Patrol Speed](!tokPat --setPatrolSpeed ?{Seconds between each movement?|1}) \n \n \n"
		
		desc += "[Toggle Patrol Path](!tokPat --togglePatrolPath) \n \n \n";
		
		desc += "[Clear Current Patrol Points](!tokPat --clearPatrol) \n \n \n";
		
		desc += "[Save Current Patrol Points](!tokPat --savePatrol) \n";
		desc += "[Load Patrol Points](!tokPat --loadPatrol) \n \n";
		
		desc += "[Toggle Logging](!tokPat --toggleLogging) \n \n";
		
		sendChat("Token Patrol", "/w gm &{template:default}{{desc=" + desc + "}}");
	}

	// toggles the drawing for showing the patrol path
	function togglePatrolPaths(){	
		if(showPath){
			createPatrolPaths();
		}else{
			destroyPatrolPaths();
		}
	}

	// create the drawings for the patrol path
	function createPatrolPaths(){
		let gm = findObjs({_type:"player"}).filter(p => playerIsGM(p.get('_id')));
		gm = gm[0];
		let gmPage = findObjs({ _type: "page", _id: gm.get("lastpage")})[0];
		
		for(let i = 0; i < patrollingTokens.length; i++){
			
			let tokenPath = "[";
			let first = true;
			let tokenLeft;
			let tokenTop;
			let data;
			
			for(let j = 0; j < patrollingTokens[i].patrolPoints.length; j++){
				if(first){
					tokenLeft = getMostLeft(patrollingTokens[i].patrolPoints)
					tokenTop = getMostTop(patrollingTokens[i].patrolPoints)
					tokenPath += '[\"M\",'+ patrollingTokens[i].patrolPoints[j].left+ ',' + patrollingTokens[i].patrolPoints[j].top + ']';
					first = false;
				}else{
					tokenPath += ',[\"L\",'+ patrollingTokens[i].patrolPoints[j].left + ',' + patrollingTokens[i].patrolPoints[j].top + ']';
				}
			}		
			if(!patrollingTokens[i].hasEndPoint){
				tokenPath += ',[\"L\",' + patrollingTokens[i].patrolPoints[0].left+ ',' + patrollingTokens[i].patrolPoints[0].top + ']';
			}		
			tokenPath += "]";
			
			if(tokenLeft === undefined && tokenTop === undefined){
				if(chatLogging){
					sendChat("Token Patrol", "/w gm &{template:default}{{desc=No Patrol to Show}}");
					return;
				}
			}
			
			data = {
				pageid: gmPage.get("id"),
				fill: "transparent",
				stroke: "#" + Math.floor(Math.random()*16777215).toString(16),
				layer: "gmlayer",
				stroke_width: 5,
				width: 0, // depends on patrol 70 or 0 
				height: 0, // depends on patrol 70 or 0
				left: tokenLeft,
				top: tokenTop,
				scaleX: 1,
				scaleY: 1,
				controlledby: gm.get("id"),
				path: tokenPath,
			}
			pathIds[i] = createObj("path", data).get("id");
		}	
	}

	// deletes the dawings for the patrol path
	function destroyPatrolPaths(){
		let gm = findObjs({_type:"player"}).filter(p => playerIsGM(p.get('_id')));
		gm = gm[0];
		let gmPage = findObjs({ _type: "page", _id: gm.get("lastpage")})[0];
		let path;
		
		for(let i = 0; i < patrollingTokens.length;i++){
			path = findObjs({ _type: "path", _id: pathIds[i]})[0];
			if(path){
				path.remove();			
			}
		}
	}

	// gets most left position for dawing the path
	function getMostLeft(patrolPoints){
		let currentMax = patrolPoints[0].left;
		for(let i = 0; i < patrolPoints.length; i++){
			if(patrolPoints[i].left < currentMax){
				currentMax = patrolPoints[i].left;
			}		
		}
		return currentMax;	
	}
	// gets most top position for dawing the path
	function getMostTop(patrolPoints){
		let currentMax = patrolPoints[0].top;
		for(let i = 0; i < patrolPoints.length; i++){
			if(patrolPoints[i].top < currentMax){
				currentMax = patrolPoints[i].top;
			}		
		}
		return currentMax;	
	}

	// toggles the logging function in the menu
	function toggleLogging(){
		chatLogging = !chatLogging;
	}

	// check if the patrol speed is valid
	function checkTokenPatrolSpeed(speedValue){	
		if(speedValue.includes(",")){
			speedValue = speedValue.replace(",",".");
		}
		if(parseFloat(speedValue)){
			patrolSpeed = speedValue*1000
		}	
	}

	// reset the var values
	function clearVars(){	
		setInitialTokentoPos();
		msgArgs = "";
		selectedToken = "";
		patrollingTokens = [];
		moveCounter = 0;
		currentPatrolPointIndex = 0;
		moveTop = 0;
		moveLeft = 0;
		hasEndPoint = false;
		IntervalID = 0;
		log("Token Patrol --> All Patrol Points cleared");
		if(chatLogging){
			sendChat("Token Patrol", "/w gm &{template:default}{{desc=All current Patrol Points have been cleared}}");
		}
	}

	// starts the patrol
	function startPatrol(){
		setInitialTokentoPos();
		intervalID = setInterval(moveTokens, patrolSpeed);
	}

	// stops the patrol
	function stopPatrol(){	
		clearInterval(intervalID);	
	}

	// saves the patrol points into state
	function savePatrol(){	
		state.Token_Patrol.savedPatrols = patrollingTokens;
		if(chatLogging){
			sendChat("Token Patrol", "/w gm &{template:default}{{desc=All current Patrol Points have been saved}}");
		}
	}

	// loads the patrol points from state
	function loadPatrol(){
		patrollingTokens = state.Token_Patrol.savedPatrols;
		
		if(chatLogging){
			sendChat("Token Patrol", "/w gm &{template:default}{{desc=Patrol Points have been loaded}}");
		}
	}

	// sets the inital Token Positions to the first patrol point
	function setInitialTokentoPos(){
		for(let i = 0; i < patrollingTokens.length; i++){
			let token = findObjs({ _type: "graphic", _id: patrollingTokens[i].tokenId})[0];
			token.set({
				left: patrollingTokens[i].patrolPoints[0].left,
				top: patrollingTokens[i].patrolPoints[0].top
			});
		}
	}

	// sets the next move for the token
	function getNextMove(tokenLeft, tokenTop, patrolPoints, currentPatrolPointIndex, hasEndPoint,i ){

		if( (tokenLeft == patrolPoints[currentPatrolPointIndex].left) && (tokenTop  == patrolPoints[currentPatrolPointIndex].top)){
			moveLeft = 0;
			moveTop = 0;
			currentPatrolPointIndex++;
		}
		
		if(patrolPoints[currentPatrolPointIndex] === "" || patrolPoints[currentPatrolPointIndex] === undefined){ 
			if(hasEndPoint){
				patrollingTokens[i].patrolPoints.reverse();
				currentPatrolPointIndex = 1;
			}else{
				currentPatrolPointIndex = 0;	
			}		
		}

		if(tokenLeft < patrolPoints[currentPatrolPointIndex].left){	moveLeft = 70;	}
		if(tokenLeft > patrolPoints[currentPatrolPointIndex].left){	moveLeft = -70;	}
		if(tokenTop  < patrolPoints[currentPatrolPointIndex].top ){	moveTop  = 70;	}
		if(tokenTop  > patrolPoints[currentPatrolPointIndex].top ){	moveTop  = -70;	}

		return currentPatrolPointIndex;
	}

	// moves the tokens
	function moveTokens(){
		playerPageId = findObjs({ _type: "campaign"})[0].get("playerpageid");
		for(let i = 0; i < patrollingTokens.length; i++){
			
			let tokenToMove = findObjs({ _type: "graphic" , _id: patrollingTokens[i].tokenId , _pageid: playerPageId })[0];
			if(tokenToMove === undefined){continue;}
			
			patrollingTokens[i].currentPatrolPointIndex = getNextMove(
				tokenToMove.get("left"), 
				tokenToMove.get("top"), 
				patrollingTokens[i].patrolPoints, 
				patrollingTokens[i].currentPatrolPointIndex,
				patrollingTokens[i].hasEndPoint,
				i
				);
			
			if(moveLeft !== 0 || moveTop !== 0){
				tokenToMove.set({
					left: +tokenToMove.get("left") + +moveLeft,
					top: +tokenToMove.get("top") + +moveTop
				});
			}
			moveLeft=0;
			moveTop=0;
			
		}
		moveCounter ++;
	}

	// adds a new patrol point into patrollingTokens
	function addPatrollingToken(){
		
		let inList = false;
		let inListAt = 0;
		
		for(let i = 0; i < patrollingTokens.length; i++){
			if(patrollingTokens[i].tokenId === selectedToken.get("id")){
				inList = true;
				inListAt = i;
				break;
			}
		}
		
		if(!inList){
			let data = {
				tokenId: selectedToken.get("id"),
				currentPatrolPointIndex: 1,
				hasEndPoint: hasEndPoint,
				patrolPoints : [{
					left: selectedToken.get("left"),
					top: selectedToken.get("top"),
				}]
			}
			patrollingTokens.push(data);
			log("Token Patrol --> Patrolpoint Added!");
			
		}else{
			addPatrolPoint(inListAt,selectedToken.get("left"),selectedToken.get("top"));
		}
		
		if(hasEndPoint){
			patrollingTokens[inListAt].hasEndPoint = hasEndPoint;
			
			if(chatLogging){
				sendChat("Token Patrol", "/w gm &{template:default}{{desc=New End Point Added for "+ selectedToken.get("name") + "}}");
			}
			hasEndPoint = false;
		}else{		
			if(chatLogging){
				sendChat("Token Patrol", "/w gm &{template:default}{{desc=New Patrol Point Added for "+ selectedToken.get("name") + "}}");
			}
		}	
		
	}

	// adds a new patrol point for a token
	function addPatrolPoint(at,ileft, itop){
		let data = {
			left: ileft,
			top: itop
		};
		patrollingTokens[at].patrolPoints.push(data);
		log("Token Patrol --> Patrolpoint Added!");
	}

	// gets selected token
	function getTokens(msg){
		let tokens = msg.selected;
		for(let i = 0; i < tokens.length; i++){
			selectedToken = findObjs({ _type: "graphic", _id: tokens[i]._id })[0];
			addPatrollingToken();
		}
	}

	// checks if all relevant macros are in the campaign
	function hasTokenPatrolMacros(){
		for(let i = 0; i < TOKEN_PATROL_MACRO_NAMES.length;i++){
			let macro = findObjs({ _type: "macro", name: TOKEN_PATROL_MACRO_NAMES[i]})[0];
			if(!macro){
				log("Token Patrol --> Macro: " + TOKEN_PATROL_MACRO_NAMES[i] + " NOT Found!");
				log("Token Patrol --> Creating Macro: " + TOKEN_PATROL_MACRO_NAMES[i]);
				createTokenPatrolMacros(TOKEN_PATROL_MACRO_NAMES[i]);
			}
		}
		log("Token Patrol --> All Macros Ready");
	}

	// creates missing macros for token patrol
	function createTokenPatrolMacros(macroname){
		let players = findObjs({_type:"player"}).filter(p => playerIsGM(p.get('_id')));
		
		let API_TokPat_Menu = {
			name: "API-TokPat-Menu",
			action: "!tokPat --menu",
			istokenaction: false,
			visibleto: "",
			_playerid: players[0].get("id")			
		}
		switch(macroname){
			case "API-TokPat-Menu":
				createObj("macro", API_TokPat_Menu);
			break;
		}
		
	}

})();
