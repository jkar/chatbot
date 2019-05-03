// i create an object called xhr with XMLHttpRequest constructor to handle the response from the server
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
const _ = require('lodash')
// this value is used to make the request from the server to get the necessary data.
var syncRequest = require('sync-request');

//in this array i pass the data from the documents that are matching with user's input. It is called temporary because for each new question on documents is being cleared
var temporaryList = [];
//a list with not important words that its input should be cleared 
const axrhstesLexeis = ["how","ho","why","wy","what","for","is","are","will","can","may","make","do","want","did","shall","should","to","find","search","am","going","way","any","there","it","that","this","if","i","dont","not","about","the"];
//all data that are being pulled from server in order to be handled by the bot.
var allList= [];

//in this array all distinct languages are passed in order to show them as possible choices for the user. 
var listWithLanguagesToShow = [];
//in this array all distinct nations are passed in order to show them as possible choices for the user. It gets data according to previous actions of user (if he/she has limited the data)
var listWithNationToShow = [];
//in this array all distinct types of documents are passed in order to show them as possible choices for the user. It gets data according to previous actions of user (if he/she has limited the data)
var listWithTypeToShow = [];
//this is the first array after user limiting data by his/her choice on language of documents
var afterLanguageList = [];
//this is the second array after user limiting data by his/her choice on nation that documents are related with
var afterNationList = [];
//this is the third array after user limiting data by his/her choice on type of documents
var afterTypeList = [];

var checkTitleList = [];

//these three variables keep the matched language,nation and type with user's input respectively, in order to show possible choice with those values
var langu = "";
var nat = "";
var typ = "";

//these two variable were used to update the trivia.json file, however they are not used anymore because file is read only once by botpress so updated version is useless
var file = require('file-system');
var fs = require('fs');

  //  this method returns the url of the data in the server
  const getRequestAPI = () => {
    //return "http://imagnisa.labs.ihu.edu.gr/cpsv/all.json";  
    return "http://imagnisa.labs.ihu.edu.gr/cpsv/"; 
    
  }

  //it hanldes data according to their type from xhr response
  function readBody(xhr) {
	    var data;
	    if (!xhr.responseType || xhr.responseType === "text") {
	        data = xhr.responseText;
	    } else if (xhr.responseType === "document") {
	        data = xhr.responseXML;
	    } else {
	        data = xhr.response;
	    }
	    return data;
	}

   // this function returns a promise object ,that means it has to return the completion or failure of an asynchronous operation, here it returns the response from an xmlhttp request
  function getDataFromServerToText () {
    return new Promise(function (resolve) {
      xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        resolve(readBody(xhr));
        }
      }
  xhr.open('GET', getRequestAPI() , true);
  xhr.send(null);
    });
  }

	function makeArrayFromText (r) {
		var txt = [];
		var txt2 = [];
		var txt3 = [];
	    txt = [];
	    txt = r.split(".json\">");
	    txt.shift();
	    txt2 = [];
	    for (var i=0; i<txt.length; i++){
	    	txt2.push(txt[i].split("</a>"));
		}
		text3 = [];
	  for (var j=0; j<txt2.length; j++) {
	  	txt3.push(txt2[j][0].trim());
	  }
	  requestForEachJson(txt3);
	}

	function requestForEachJson (list) { 
		var res = [];

		res = [];
		for (var i=0; i<list.length; i++){
			
			var request = getRequestAPI().concat(list[i]);
      		res.push(JSON.parse(syncRequest('GET', request).body));
      		
		}
		//console.log(res);
		 for (var z=0; z<res.length; z++) {
        var kathejson = res[z];
        var j = kathejson[3];

        var url = j["@id"];
        var title = j["http://purl.org/dc/terms/title"][0]["@value"];
        var description = j["http://purl.org/dc/terms/description"][0]["@value"];
        var keywords = [];
        var k = j["http://www.w3.org/ns/dcat#keyword"]
        for (var w =0; w<k.length; w++) {
          keywords.push(k[w]["@value"]);
      }

      var lang = j["http://purl.org/dc/terms/language"][0]["@id"].substring(58);
      var nation = j["http://purl.org/dc/terms/spatial"][0]["@id"].substring(55);

      allList.push({"title": title,"url": url,"description": description,"keywords": keywords,"lang": lang,"nation": nation });
    }
	}

module.exports = {

  // this method requests and stores the data from the server to allList array in order to be managed from the  botpress. It is declared as async to handle the return promise of getDataFromServerToText() method
  getAllJsonInternetFileAndStore: async (state, event) => {

    // clearing the list in case user resets the converastion with botpress, to avoid requesting data multiple times
    allList= [];

    //The await expression causes async function execution to pause until a Promise is resolved, 
	//that is fulfilled or rejected, and to resume execution of the async function after fulfillment. 
	//When resumed, the value of the await expression is that of the fulfilled Promise
// await code here
	var result = await getDataFromServerToText ();
  // code below here will only execute when await getDataFromServerToText() finished loading
  makeArrayFromText (result);
     
    return {
      ...state, // we clone the existing state
      count: 0, // we then reset the number of questions asked to `0`
      score: 0 // and we reset the score to `0`
    }
  },

  // this is the first question to the user about preferable language of documents. he/she may skip that question to ask for all languages. The choice buttons are filled according to the existing languages
  showQuestionforLanguage: async (state, event) => {

    var countlang=0;
    var listl=[];
    listWithLanguagesToShow = [];

    for (i=0; i<allList.length; i++) {
      listl.push(allList[i].lang);
    }
    //s auth th lista krataw mono distinct values
    listWithLanguagesToShow = [...new Set(listl)];
    countlang = listWithLanguagesToShow.length;

    if (countlang==1) {
        event.user.lang1 = listWithLanguagesToShow[0];
        const messageSent = await event.reply('#!trivia-2erwa3');
    } else if (countlang==2) {
        event.user.lang1 = listWithLanguagesToShow[0];
        event.user.lang2 = listWithLanguagesToShow[1];
        const messageSent = await event.reply('#!trivia-qf4w5b');
    } else if (countlang==3) {
        event.user.lang1 = listWithLanguagesToShow[0];
        event.user.lang2 = listWithLanguagesToShow[1];
        event.user.lang3 = listWithLanguagesToShow[2];
        const messageSent = await event.reply('#!trivia-qr4e2e');
    } else if (countlang>3) {
        event.user.lang1 = listWithLanguagesToShow[0];
        event.user.lang2 = listWithLanguagesToShow[1];
        event.user.lang3 = listWithLanguagesToShow[2];
        const messageSent = await event.reply('#!trivia-ar4d7w');
    }

    return {
      ...state
    }
  },

  //chekarw an to input matsarei me ta jsons sto language, k osa nai, ta krataw se allo array sto afterLanguageList gia pio scoped search
  checkQuestionForLanguage: async (state, event) => {

    var langExists = false; 
    langu = "";
    var nextQuestion = false;
    var buttonLangPressed = false;
    // mhdenizw th lista se periptwsh pou kanw xanagurisw sthn idia erwthsh k exei hdh trabhxei..na mh trabaei deuterh fora k exei duplicate
    afterLanguageList = [];

   if (event.text.length<3) {
    langExists = false;
   
   } else  {

     //spaw th protash se strings mesa se ena array
    var substringList = event.text.split(" ");

    //tha chekarw kathe string apto array an einai mono ena gramma na diagrafetai, k an exei erwthmatiko na feugei apo th lexh gia na kanei search xwris auto
    for (var c=0; c<substringList.length; c++) {

      //afairw apo osa strings exoun to "?"
      if (substringList[c].includes("?")) {
        substringList[c] = substringList[c].replace('?','');
        }
      //afairw apo osa strings exoun to ".""
      if (substringList[c].includes(".")) {
        substringList[c] = substringList[c].replace(/./g,'');
        }
      //afairw apo osa strings exoun to ","
      if (substringList[c].includes(",")) {
        substringList[c] = substringList[c].replace(/,/g,'');
        }
  
      //chekarw poies lexeis apo to input einai idies me tou list ,axrhstesLexeis k tis diagrafw
      for (var y=0; y<axrhstesLexeis.length; y++) {
          if (substringList[c]==axrhstesLexeis[y]) {
              substringList.splice(c, 1);
          }
        }  
    }  
    
    //se xehwristh for apo thn panw giati alliws molis afairesei mia lexh p matsarei apo to axrhstes lexeis thn epomenh thn ekane uppercase k den borei na matsarei
    for (var i = 0; i<substringList.length; i++) {
      //kanw kathe lexh me kefalaia k mono 3 grammata gia na kanei match me to lang p einai 3 grammata k kefalaia
      substringList[i] = substringList[i].toUpperCase(); 
      if (substringList[i].length>3) {
      substringList[i] = substringList[i].substring(0,3);   
      }
    }
    substringList.forEach(function(item, index, object) {
  		if ((item.length>3) || (item.length<2) || (item === '') || (item === ' ')) {
    		object.splice(index, 1);
  			}
	});
    //if user's input matches with an element langExists gets true and langu gets the value , the flow moves to showQuestionFor to let user accept or not the found element
    for (var e=0; e<allList.length; e++) { 
      for (var w=0; w<substringList.length; w++) {
          
          if (allList[e].lang.includes(substringList[w])){  
          langExists = true;
          langu = allList[e].lang;
               }
    }
  }
  // if user selects a button choice , buttonLangpressed gets true and afterLanguageList gets filled to go to showQuestionForNation
  for (i=0; i<listWithLanguagesToShow.length; i++) {
    if (event.text==listWithLanguagesToShow[i]) {
      buttonLangPressed = true;
      for (var p=0; p<allList.length; p++) {
      if (allList[p].lang.includes(event.text)) {
          afterLanguageList.push({"title": allList[p].title,"url": allList[p].url,"description": allList[p].description,"keywords": allList[p].keywords,"lang": allList[p].lang,"nation": allList[p].nation });
      	}
      }
    }
  }
    // if user presses 'Skip question' button, nextQuestion gets true so flow will move to showQuestionForNation
    if (event.text=="Skip question") {
      nextQuestion = true;
    }
   } 
    return {
      buttonLangPressed,
      nextQuestion,
      langExists,
      langu
    }
  },

  showQuestionfor: async (state, event) => {

    event.user.lang = langu;
    const messageSent = await event.reply('#!trivia-wex2r4');
    return {
      ...state
    }
  },

  checkQuestionFor(state, event) {
    var acceptLang = false; 

   if (event.text != "accept " + langu) {
    acceptLang = false;
   
   } else  {

    for (var p=0; p<allList.length; p++) {
      if (allList[p].lang.includes(langu)) {
        acceptLang = true;
        afterLanguageList.push({"title": allList[p].title,"url": allList[p].url,"description": allList[p].description,"keywords": allList[p].keywords,"lang": allList[p].lang,"nation": allList[p].nation });
      }
    }
   } 
    return {
      acceptLang
    }
  }, 

  showQuestionforNation: async (state, event) => {

    var countNat=0;
    var listn=[];
    listWithNationToShow = [];

    //an sth prohgoumenh erwthsh pathsei o xrhsths NEXT QUESTION tote h lista tha nai  kenh, giauto tha toh gemizw ap eutheias me ola ta json arxeia
    if(afterLanguageList.length==0) {
      afterLanguageList = allList;
    }
    //edw pernaw ola ta  dedomena gia lang apo th lista pou exw ola ta data apo server
    for (i=0; i<afterLanguageList.length; i++) {
      listn.push(afterLanguageList[i].nation);
    }
    //s auth th lista krataw mono distinct values
    listWithNationToShow = [...new Set(listn)];
    countlang = listWithNationToShow.length;

    if (countlang==1) {
        event.user.nat1 = listWithNationToShow[0];
        const messageSent = await event.reply('#!trivia-sz4dq3');
    } else if (countlang==2) {
        event.user.nat1 = listWithNationToShow[0];
        event.user.nat2 = listWithNationToShow[1];
        const messageSent = await event.reply('#!trivia-wz1sq5');
    } else if (countlang==3) {
        event.user.nat1 = listWithNationToShow[0];
        event.user.nat2 = listWithNationToShow[1];
        event.user.nat3 = listWithNationToShow[2];
        const messageSent = await event.reply('#!trivia-3wzad8');
    } else if (countlang>3) {
        event.user.nat1 = listWithNationToShow[0];
        event.user.nat2 = listWithNationToShow[1];
        event.user.nat3 = listWithNationToShow[2];
        const messageSent = await event.reply('#!trivia-f2ga4d');
    }
    return {
      ...state
    }
  },

  checkQuestionForNation(state, event) {

    nat = "";
    var NationExists = false;
    var nextQuestion2 = false; 
    var buttonNationPressed = false;
    // mhdenizw th lista se periptwsh pou kanw xanagurisw sthn idia erwthsh k exei hdh trabhxei..na mh trabaei deuterh fora k exei duplicate
    afterNationList = [];

   if (event.text.length<3) {
    NationExists = false;
   
   } else  {

    //spaw th protash se strings mesa se ena array
    var substringList = event.text.split(" ");

    //tha chekarw kathe string apto array an einai mono ena gramma na diagrafetai, k an exei erwthmatiko na feugei apo th lexh gia na kanei search xwris auto
    for (var c=0; c<substringList.length; c++) {

      //afairw apo osa strings exoun to "?"
      if (substringList[c].includes("?")) {
        substringList[c] = substringList[c].replace('?','');
        }
      //afairw apo osa strings exoun to ".""
      if (substringList[c].includes(".")) {
        substringList[c] = substringList[c].replace(/./g,'');
        }
      //afairw apo osa strings exoun to ","
      if (substringList[c].includes(",")) {
        substringList[c] = substringList[c].replace(/,/g,'');
        }
      //diagrafw to string an exei ena gramma mono
      if (substringList[c].length==1) {
        substringList.splice(c,1);
      }

      //chekarw poies lexeis apo to input einai idies me tou list ,axrhstesLexeis k tis diagrafw
      for (var y=0; y<axrhstesLexeis.length; y++) {
        if (substringList[c]==axrhstesLexeis[y]) {
            substringList.splice(c , 1);
        }
      }

      //kanw kathe lexh me kefalaia k mono 3 grammata gia na kanei match me to lang p einai 3 grammata k kefalaia
      substringList[c] = substringList[c].toUpperCase();
      
      if (substringList[c].length>3) {
      substringList[c] = substringList[c].substring(0,3);   
      }

    }
    substringList.forEach(function(item, index, object) {
  		if ((item.length>3) || (item.length<2) || (item === '') || (item === ' ')) {
    		object.splice(index, 1);
  			}
	});
    //an sth prohgoumenh erwthsh pathsei o xrhsths NEXT QUESTION tote h lista tha nai  kenh, giauto tha toh gemizw ap eutheias me ola ta json arxeia
    if(afterLanguageList.length==0) {
      afterLanguageList = allList;
    } 

    for (var p=0; p<afterLanguageList.length; p++) {
      for (var w=0; w<substringList.length; w++) {
        if (afterLanguageList[p].nation.includes(substringList[w])) {
          NationExists = true;
          console.log("NationExists is " + NationExists)
          nat = afterLanguageList[p].nation;
        }
      }
    }

    for (i=0; i<listWithNationToShow.length; i++) {
    if (event.text==listWithNationToShow[i]) {
      buttonNationPressed = true;

      for (var p=0; p<afterLanguageList.length; p++) {
      if (afterLanguageList[p].nation.includes(event.text)) {
          afterNationList.push({"title": afterLanguageList[p].title,"url": afterLanguageList[p].url,"description": afterLanguageList[p].description,"keywords": afterLanguageList[p].keywords,"lang": afterLanguageList[p].lang,"nation": afterLanguageList[p].nation });
      }
    }
    }
  }

    if (event.text=="Skip question") {
      nextQuestion2 = true;
    }
   } 
    return {
      buttonNationPressed,
      nextQuestion2,
      NationExists,
      nat
    }
  },  

  showQuestionfor2: async (state, event) => {

    event.user.nation = nat;
    const messageSent = await event.reply('#!trivia-qrz1r6');
    return {
      ...state
    }
  },

  checkQuestionFor2(state, event) {
    var acceptNation = false; 

   if (event.text != "accept " + nat) {
    acceptNation = false;
   
   } else  {

    for (var p=0; p<afterLanguageList.length; p++) {
      if (afterLanguageList[p].nation.includes(nat)) {
        acceptNation = true;
        console.log("acceptn is " + acceptNation)
        afterNationList.push({"title": afterLanguageList[p].title,"url": afterLanguageList[p].url,"description": afterLanguageList[p].description,"keywords": afterLanguageList[p].keywords,"lang": afterLanguageList[p].lang,"nation": afterLanguageList[p].nation });
      }
    }
   } 
   console.log(afterNationList);
    return {
      acceptNation
    }
  }, 



  showQuestionforType: async (state, event) => {

  	var countType=0;
    var listt=[];
    listWithTypeToShow = [];

   //an sth prohgoumenh erwthsh pathsei o xrhsths NEXT QUESTION tote h lista tha nai  kenh, giauto tha toh gemizw ap eutheias me ola ta json arxeia
    if(afterNationList.length==0) {
      afterNationList = afterLanguageList;
    }
    //edw pernaw ola ta  dedomena gia lang apo th lista pou exw ola ta data apo server
    for (var i=0; i<afterNationList.length; i++) {
    	for (var j=0; j<afterNationList[i].keywords.length; j++) {
      		listt.push(afterNationList[i].keywords[j]);
  		}
    }
    //s auth th lista krataw mono distinct values
    listWithTypeToShow = [...new Set(listt)];
    countType = listWithTypeToShow.length;
    if (countType==1) {
        event.user.type1 = listWithTypeToShow[0];
        const messageSent = await event.reply('#!trivia-az2rq5');
    } else if (countType==2) {
        event.user.type1 = listWithTypeToShow[0];
        event.user.type2 = listWithTypeToShow[1];
        const messageSent = await event.reply('#!trivia-4as3e8');
    } else if (countType==3) {
        event.user.type1 = listWithTypeToShow[0];
        event.user.type2 = listWithTypeToShow[1];
        event.user.type3 = listWithTypeToShow[2];
        const messageSent = await event.reply('#!trivia-a3s13t');
    } else if (countType>3) {
        event.user.type1 = listWithTypeToShow[0];
        event.user.type2 = listWithTypeToShow[1];
        event.user.type3 = listWithTypeToShow[2];
        const messageSent = await event.reply('#!trivia-q7d41h');
    }
    return {
      ...state
    }
  },

  checkQuestionForType(state, event) {

    typ ="";
    var typeExists = false;
    var nextQuestion3 = false; 
    var buttonTypePressed = false;
    // mhdenizw th lista se periptwsh pou kanw xanagurisw sthn idia erwthsh k exei hdh trabhxei..na mh trabaei deuterh fora k exei duplicate
    afterTypeList = [];

   if (event.text.length<3) {
    typeExists = false;
   
   } else  {

    //spaw th protash se strings mesa se ena array
    var substringList = event.text.split(" ");

    //tha chekarw kathe string apto array an einai mono ena gramma na diagrafetai, k an exei erwthmatiko na feugei apo th lexh gia na kanei search xwris auto
    for (var c=0; c<substringList.length; c++) {

      //afairw apo osa strings exoun to "?"
      if (substringList[c].includes("?")) {
        substringList[c] = substringList[c].replace('?','');
        }
      //afairw apo osa strings exoun to ".""
      if (substringList[c].includes(".")) {
        substringList[c] = substringList[c].replace(/./g,'');
        }
      //afairw apo osa strings exoun to ","
      if (substringList[c].includes(",")) {
        substringList[c] = substringList[c].replace(/,/g,'');
        }
  
      //diagrafw to string an exei ena gramma mono
      if (substringList[c].length==1) {
        substringList.splice(c,1);
      }

      //chekarw poies lexeis apo to input einai idies me tou list ,axrhstesLexeis k tis diagrafw
      for (var y=0; y<axrhstesLexeis.length; y++) {
        if (substringList[c]==axrhstesLexeis[y]) {
            substringList.splice(c , 1);
        }
      } 
    }
    substringList.forEach(function(item, index, object) {
  		if ((item.length<2) || (item === '') || (item === ' ')) {
    		object.splice(index, 1);
  			}
	});
    //an sth prohgoumenh erwthsh pathsei o xrhsths NEXT QUESTION tote h lista tha nai  kenh, giauto tha toh gemizw ap eutheias me ola ta json arxeia ths prohgoumenhs listas
    if(afterNationList.length==0) {
      afterNationList = afterLanguageList;
    } 

    for (var p=0; p<afterNationList.length; p++) {
      for (var t=0; t<afterNationList[p].keywords.length; t++) {
          for (var w=0; w<substringList.length; w++) {
            if (afterNationList[p].keywords[t].includes(substringList[w])) {
            typeExists = true;
            typ = afterNationList[p].keywords[t];
            }        
          }
      }
    }

    for (i=0; i<listWithTypeToShow.length; i++) {
    	if (event.text==listWithTypeToShow[i]) {
      		buttonTypePressed = true;

      		for (var p=0; p<afterNationList.length; p++) {
      			for (var k=0; k<afterNationList[p].keywords.length; k++){
      				if (afterLanguageList[p].keywords[k].includes(event.text)) {
          				afterTypeList.push({"title": afterNationList[p].title,"url": afterNationList[p].url,"description": afterNationList[p].description,"keywords": afterNationList[p].keywords,"lang": afterNationList[p].lang,"nation": afterNationList[p].nation });
      				}
      			}	
    		}
    	}
  	}

    if (event.text=="Skip question") {
      nextQuestion3 = true;
    }
    }
    return {
   	  buttonTypePressed,
      typeExists,
      typ,
      nextQuestion3
    }
  },

   showQuestionfor3: async (state, event) => {

    event.user.type = typ;
    const messageSent = await event.reply('#!trivia-ske4t2');
    return {
      ...state
    }
  },

  checkQuestionFor3(state, event) {
    var acceptType = false; 

   if (event.text != "accept " + typ) {
    acceptLang = false;
   
   } else  {

    for (var p=0; p<afterNationList.length; p++) {
      for (var t=0; t<afterNationList[p].keywords.length; t++) {
          if (afterNationList[p].keywords[t].includes(typ)) {
            acceptType = true;
            afterTypeList.push({"title": afterNationList[p].title,"url": afterNationList[p].url,"description": afterNationList[p].description,"keywords": afterNationList[p].keywords,"lang": afterNationList[p].lang,"nation": afterNationList[p].nation });       
          }
        }
      }
    } 
    return {
      acceptType
    }
  },


  //s ayth th methodo blepw an sthn array allDataList uparxei kapoio title p matsaretai h teleiws h se kapoia upokommatia apo to input t xrhsth gia na krathsw plenon oti m endiaferei k na t perasw mea st json
  checkAllDataListForInput(state, event) {
    //trabaw to input tou xrhsth
    var inp = event.text;
    //spaw th protash se strings mesa se ena array
    var substringList = inp.split(" ");

    //tha chekarw kathe string apto array an einai mono ena gramma na diagrafetai, k an exei erwthmatiko na feugei apo th lexh gia na kanei search xwris auto
    for (var c=0; c<substringList.length; c++) {

      //diagrafw to string an exei ena gramma mono
      if (substringList[c].length==1) {
        substringList.splice(c,1);
      }
      //afairw apo osa strings exoun to "?"
      if (substringList[c].includes("?")) {
        substringList[c] = substringList[c].replace('?','');
        }
      //afairw apo osa strings exoun to ".""
      if (substringList[c].includes(".")) {
        substringList[c] = substringList[c].replace('.','');
        }
      //afairw apo osa strings exoun to ","
      if (substringList[c].includes(",")) {
        substringList[c] = substringList[c].replace(',','');
        }
    }
    
    //chekarw poies lexeis apo to input einai idies me tou list ,axrhstesLexeis k tis diagrafw
    for (var x=0; x<substringList.length; x++) {
      for (var y=0; y<axrhstesLexeis.length; y++) {
        if (substringList[x]==axrhstesLexeis[y]) {
            substringList.splice(x , 1);
        }
      }
    }
    //deleting null values from substringList
    substringList.forEach(function(item, index, object) {
  		if ((item === '') || (item === ' ')) {
    		object.splice(index, 1);
  			}
	});    
    //to thetw kathe fora arxika false , k uparxei kapoia lexh antistoixh me t input to kanw true
    var exists = false;

    //an sth prohgoumenh erwthsh pathsei o xrhsths NEXT QUESTION tote h lista tha nai  kenh, giauto tha toh gemizw ap eutheias me ola ta json arxeia ths prohgoumenhs listas
    if(afterTypeList.length==0) {
      afterTypeList = afterNationList;
    } 

    //chekarw apo to arxeio p tha exw ola ta dedomena, edw peiramatika to allDataList, an antistoixei kapoio string tou input, an nai sthn temporaryList pernaw ton titlo gia na ton emfanizw, sun kanw to exists true
    for (var j=0; j<afterTypeList.length; j++) { 
      for (var w=0; w<substringList.length; w++) {
          //if (allDataList[j].title.includes(inp)){
          if (afterTypeList[j].title.includes(substringList[w])){  
          exists = true;
          temporaryList.push({"title": afterTypeList[j].title,"url": afterTypeList[j].url,"description": afterTypeList[j].description,"keywords": afterTypeList[j].keywords,"lang": afterTypeList[j].lang,"nation": afterTypeList[j].nation });
        }
      }
    }
      return {
      ...state, // We clone the state
    exists,
    count: state.count + 1
    }
  },

  showQuestion: async (state, event) => {

     // i initialize them for each search to find how many answers have been given
    var countResponses = 0;
    event.user.title1 = "";
    event.user.title2 = "";
    event.user.title3 = "";
    event.user.title4 = "";
    event.user.title5 = "";
    event.user.title6 = "";

    event.user.url="";

    countResponses = temporaryList.length;

    if(countResponses==1) {

      event.user.url = temporaryList[0].url.split("/").join("\\");

      event.user.title1 = temporaryList[0].title;


      const messageSent = await event.reply('#!trivia-U_3sZz')
    } else if (countResponses==2) {
      event.user.title1 = temporaryList[0].title;
      event.user.title2 = temporaryList[1].title;
       const messageSent = await event.reply('#!trivia-DEiIPP')
    } else if (countResponses==3) {
      event.user.title1 = temporaryList[0].title;
      event.user.title2 = temporaryList[1].title;
      event.user.title3 = temporaryList[2].title;
      const messageSent = await event.reply('#!trivia-wImL3f')
    } else if (countResponses==4) {
      event.user.title1 = temporaryList[0].title;
      event.user.title2 = temporaryList[1].title;
      event.user.title3 = temporaryList[2].title;
      event.user.title4 = temporaryList[3].title;
      const messageSent = await event.reply('#!trivia-zsfQQm')
    } else if (countResponses==5) {
      event.user.title1 = temporaryList[0].title;
      event.user.title2 = temporaryList[1].title;
      event.user.title3 = temporaryList[2].title;
      event.user.title4 = temporaryList[3].title;
      event.user.title5 = temporaryList[4].title;
      const messageSent = await event.reply('#!trivia-dd3RQE')
    } else if (countResponses>=6) {
      event.user.title1 = temporaryList[0].title;
      event.user.title2 = temporaryList[1].title;
      event.user.title3 = temporaryList[2].title;
      event.user.title4 = temporaryList[3].title;
      event.user.title5 = temporaryList[4].title;
      event.user.title6 = temporaryList[5].title;
      const messageSent = await event.reply('#!trivia-9Jn6J2')
    }

    checkTitleList = temporaryList;

    //mhdenizw xana to temporaryList
    temporaryList = [];
   
    return {
      ...state, // We clone the state
      isCorrect: true, //gia na trexei sunexeia!!!!
      count: state.count + 1, // We increase the number of questions we asked so far

    }
  },

   checkTitleToSHowUrl: async (state, event) => {

    var urlExists = false;

    for (var c = 0; c < checkTitleList.length; c++) {
      if (event.text==checkTitleList[c].title) {

        //edw pairnei to swsto index to rightPosition gia na emfanizei swsto url sto method showUrl
        rightPosition = c;
        urlExists = true;
      }
    }
    return {
      urlExists,
    }
   },

    showUrl: async (state, event) => {

    event.user.url = checkTitleList[rightPosition].url.split("/").join("\\");
    event.user.title7 = checkTitleList[rightPosition].title;

    checkTitleList = [];
   
    return {
      ...state
    }
   },

  render: async (state, event, args) => {
    if (!args.renderer) {
      throw new Error('Missing "renderer"')
    }

    await event.reply(args.renderer, args)
  }

}
