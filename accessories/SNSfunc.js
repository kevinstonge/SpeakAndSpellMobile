const SNSfunc = {
    resetVariables(SNSvars) {
      SNSvars.spellProgress = 0; SNSvars.correctWords = 0; SNSvars.displayedText = ""; SNSvars.level = "a"; SNSvars.spellingWords = []; SNSvars.audioBuffer = []; SNSvars.spellAttempts = 0; SNSvars.wait = false; SNSvars.mysteryWord = ""; SNSvars.mysteryWordGuesses = 0; SNSvars.mysteryWordShard = ""; SNSvars.audioArray.length = 0; SNSvars.textArray.length = 0;
      return SNSvars;
    },
    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    shuffle (a) {
      let i=0; let j=0; let t=null;
      for (i = a.length - 1; i > 0; i -= 1) {
        j=Math.floor(Math.random() * (i + 1));
        t=a[i];
        a[i]=a[j];
        a[j]=t;
      }
      return a;
    },
    highlightOn(SNSstate,SNSfunctions) {
      let newState = SNSstate;
      newState[0]=1;
      SNSfunctions.SNSdisplay(newState);
      setTimeout(SNSfunctions.highlightOff,500,newState,SNSfunctions);
    },
    highlightOff(SNSstate,SNSfunctions) {
      let newState = SNSstate;
      newState[0]=0;
      SNSfunctions.SNSdisplay(newState);
    },
    clearDisplay(SNSfunctions) {
      const newState = { };
      for (let i=1; i<9; i++) {
        newState[i]=[];
        for (let j=1; j<17; j++) {
          newState[i][j]=0;
        }
      }
      SNSfunctions.SNSdisplay(newState);
    },
    pushOutput(outputText,SNSvars,SNSfunctions) {
      SNSfunctions.clearDisplay(SNSfunctions);
      const newState = { };
      for (let i=1; i<9; i++) {
        newState[i]=[];
        let segments = SNSvars.outputCodes[outputText.substr(i-1,1)];
        for (let j=1; j<17; j++) {
          let x = 0;
          //if (segments && Object.values(segments).includes(j)) { x = 1; } // works on modern browsers
          if (segments && Object.keys(segments).map(key => segments[key]).indexOf(j) > -1) { x = 1; } //for browser compatibility
          newState[i][j]=x;
        }
      }
      SNSvars.displayedText=outputText;
      SNSfunctions.SNSdisplay(newState);
    },
    spellNext(SNSvars,SNSstate,SNSfunctions) {
      if (SNSvars.spellProgress < 10) {
        //should create homoHandler() because this is repeated if next=true later.
        let rawWord = SNSvars.spellingWords[SNSvars.spellProgress];
        let homo = rawWord.substr(rawWord.length - 2);
        let word = rawWord;
        let homophone = false;
        if (homo === "-x") {
          homophone = true;
          word = rawWord.substr(0,rawWord.length-2);
        }
        let userAnswer = SNSvars.displayedText.replace(/[_]/g,'');
        //game initialize, first word
        if (SNSvars.spellProgress === 0 && SNSvars.spellAttempts === 0) {
          SNSvars.audioArray.push("spell", word); SNSvars.textArray.push("_","_");
          if (homophone) { SNSvars.audioArray.push("as_in", word, rawWord); SNSvars.textArray.push("_","_","_"); }
        }
        let next=false;
        //correct on first try
        if (SNSvars.spellAttempts === 1 && word === userAnswer) {
          SNSvars.correctWords += 1;
          SNSvars.spellProgress += 1;
          SNSvars.spellAttempts = 0;
          SNSvars.audioArray.push('correct' + SNSfunctions.randomInt(0,3));
          SNSvars.textArray.push(SNSvars.displayedText);
          next=true;
        }
        //incorrect on first try
        else if (SNSvars.spellAttempts === 1 && word !== userAnswer) {
          SNSvars.audioArray.push('wrong', word);
          SNSvars.textArray.push("_", "_");
        }
        //correct on second try
        else if (SNSvars.spellAttempts === 2 && word === userAnswer) {
          SNSvars.spellProgress += 1;
          SNSvars.spellAttempts = 0;
          SNSvars.audioArray.push('correct' + this.randomInt(0,3));
          SNSvars.textArray.push(SNSvars.displayedText);
          next=true;
        }
        //incorrect on second try
        else if (SNSvars.spellAttempts === 2 && word !== userAnswer) {
          SNSvars.spellProgress +=1;
          SNSvars.spellAttempts = 0;
          SNSvars.audioArray.push('incorrect', word, 'is');
          SNSvars.textArray.push(SNSvars.displayedText, '_')
          for (let i=0;i<word.length;i++) {
            SNSvars.audioArray.push(word.substr(i,1));
            SNSvars.textArray.push(word.substr(0,i) + '_');
          }
          SNSvars.audioArray.push(word);
          SNSvars.textArray.push(word + "_", word + "_");
          next=true
        }
        if (next===true && SNSvars.spellProgress < 10) {
          //create homoHandler() ??
          let rawWord = SNSvars.spellingWords[SNSvars.spellProgress];
          let homo = rawWord.substr(rawWord.length - 2);
          let word = rawWord;
          let homophone = false;
          if (homo === "-x") {
            homophone = true;
            word = rawWord.substr(0,rawWord.length-2);
          }
          SNSvars.audioArray.push("next" + SNSfunctions.randomInt(1,4), word); SNSvars.textArray.push("_","_");
          if (homophone) { 
            SNSvars.audioArray.push("as_in", word, rawWord);
            SNSvars.textArray.push("_","_","_");
          }
        }
      }
    //completed all words - display score
      if (SNSvars.spellProgress === 10) {
        let wrongWords = 10 - SNSvars.correctWords;
        let displayedScore = "+" + SNSvars.correctWords + "  -" + wrongWords;
        if (wrongWords === 0) {
          SNSvars.textArray.push(displayedScore, displayedScore, displayedScore, displayedScore);
          SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4), "activity" + SNSfunctions.randomInt(1,4), "activity" + SNSfunctions.randomInt(1,4), "perfect_score");
        }
        else {
          SNSvars.textArray.push(displayedScore, displayedScore, displayedScore, displayedScore, displayedScore, displayedScore, displayedScore);
          SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4), "activity" + SNSfunctions.randomInt(1,4), 'your_score', SNSvars.correctWords, "correct", wrongWords, "wrong2");
        }
      }
    },
    buttonPress(button,SNSvars,SNSstate,SNSfunctions) {
      if (!/^[a-z]+$/.test(button)) { button = parseInt(button); }
      if (SNSvars.wait === true && SNSvars.waitButtons.indexOf(button) === -1) { return; };
      if (button === 1) {  //off
        SNSfunctions.clearDisplay(SNSfunctions); SNSvars = SNSfunctions.resetVariables(SNSvars); SNSvars.mode = "off"; 
      };
      if (button === 10) { //on
        SNSvars = SNSfunctions.resetVariables(SNSvars);
        if (SNSvars.mode === "off") {
          SNSvars.audioArray.push("activity1");
        }
        else {
          SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4));
        };
        SNSvars.textArray.push("spell  a");
        SNSvars.mode = "on-spella";
      };
      if (button >= 11 && button <= 36) { //letter button
        button = String.fromCharCode(button*1+86); 
      };
      if (button === 37) { button = "'"; }; //apostrophe button
      if (SNSvars.mode === "off" & button !== 10 && button !== 1) { this.highlightOn(SNSstate,SNSfunctions); };
      if (SNSvars.mode.slice(0,8) === "on-spell" && (/^[a-d]+$/.test(button))) { 
        SNSvars.audioArray.push(button); 
        SNSvars.textArray.push("spell  " + button); 
        SNSvars.mode = "on-spell" + button; 
      };
      if (SNSvars.mode !== "off" && button === 9) { 
        SNSvars.audioArray.push("activity1"); 
        SNSvars.textArray.push("say it a"); 
        SNSvars.mode = "on-sayita"; 
      };
      if (SNSvars.mode.slice(0,8) === "on-sayit" && (/^[a-d]+$/.test(button))) { 
        SNSvars.audioArray.push(button); 
        SNSvars.textArray.push("say it " + button); 
        SNSvars.mode = "on-sayit" + button; 
      };
      if (SNSvars.mode.slice(0,2) === "on" && ((/^[e-z]+$/.test(button) || button === "'"))) {
        SNSvars.audioArray.push(button); 
        SNSvars.textArray.push(SNSvars.displayedText); 
      };
      if (button === 2 && (SNSvars.mode.slice(3,8) === "spell" || SNSvars.mode.slice(3,8) === "sayit")) {
        SNSvars.level = SNSvars.mode.slice(8,9);
        SNSvars.spellProgress = 0;
        SNSvars.spellAttempts = 0;
        SNSvars.correctWords = 0;
        SNSvars.spellingWords = SNSvars.words[SNSvars.level];
        SNSvars.spellingWords = SNSfunctions.shuffle(SNSvars.spellingWords);
        SNSvars.spellingWords = SNSvars.spellingWords.slice(0,10);
        if (SNSvars.mode.slice(3,8) === "sayit") {
          for (let i = 0; i<SNSvars.spellingWords.length; i++) {
            if (SNSvars.spellingWords[i].substr(SNSvars.spellingWords[i].length - 2) === "-x") { SNSvars.word = SNSvars.spellingWords[i].substr(0,SNSvars.spellingWords[i].length-2); }
            else { SNSvars.word = SNSvars.spellingWords[i]; }
            SNSvars.audioArray.push("sayit", SNSvars.word, "silence");
            SNSvars.textArray.push(SNSvars.word, SNSvars.word, SNSvars.word);
          };
        }
        SNSvars.mode = "go-spell" + SNSvars.level;
        SNSfunctions.spellNext(SNSvars,SNSstate,SNSfunctions);
      };
      if (SNSvars.mode !== "off" && button === 8) {
        SNSvars.mode = "letter";
        let letter =  String.fromCharCode(97 + Math.floor(Math.random() * 26));
        SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4), letter);
        SNSvars.textArray.push(letter + "_", letter + "_");
      }
      if (SNSvars.mode !== "off" && button === 7) {
        SNSvars.mode = "code";
        SNSvars.textArray.push("_");
        SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4));
      };
      if ((/^[a-z]+$/.test(button) || button === "'") && (SNSvars.mode.slice(0,8) === "go-spell" || SNSvars.mode.slice(0,4) === "code" || SNSvars.mode.slice(0,6) === "letter")) {
        let truncatedText = SNSvars.displayedText.replace(/[_]/g,'');
        let newText = truncatedText + button;
        if (newText.length < 8) { 
          SNSvars.textArray.push(newText + "_"); 
          SNSvars.audioArray.push(button); 
        }
        else if (newText.length === 8 ) { 
          SNSvars.textArray.push(newText); 
          SNSvars.audioArray.push(button); 
        }
        else { 
          SNSvars.textArray.push(newText.slice(0,8)); 
          SNSvars.audioArray.push("'"); 
        };
      };
      if (button === 39 && (SNSvars.mode.slice(0,8) === "go-spell" || SNSvars.mode.slice(0,4) === "code" || SNSvars.mode.slice(0,6) === "letter")) { 
        SNSfunctions.pushOutput("_",SNSvars,SNSfunctions);
      }; 
      if (button === 40 && (SNSvars.mode.slice(0,4) === "code" || SNSvars.mode.slice(0,6) === "letter")) {
        let input = SNSvars.displayedText.replace(/[_]/g,'');
        let decode = "";
        for (let i = 0; i<input.length; i++) {
          decode += SNSvars.codeB[SNSvars.codeA.indexOf(input[i])];
        };
        SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4));
        SNSvars.textArray.push(decode + "_");
      };
      if (SNSvars.mode.slice(0,8) === "go-spell" && button === 40) {
        SNSvars.spellAttempts += 1;
        SNSfunctions.spellNext(SNSvars,SNSstate,SNSfunctions);
      };
      if (SNSvars.mode.slice(0,8) === "go-spell" && button === 3) {
        SNSvars.spellProgress = 0;
        SNSvars.spellAttempts = 0;
        SNSvars.correctWords = 0;
      }
      if (SNSvars.mode.slice(0, 8) === "go-spell" && button === 4) { //repeat button
        let word = SNSvars.spellingWords[SNSvars.spellProgress];
        word = (word.match("-x") ? word.substr(0,word.length - 2) : word);
        SNSvars.audioArray.push(word);
        SNSvars.textArray.push(SNSvars.displayedText); 
      }
      if (SNSvars.mode !== "off" && button === 6) {
        SNSvars.mysteryWord = SNSvars.mysteryWords[SNSfunctions.randomInt(0,SNSvars.mysteryWords.length-1)];
        SNSvars.mysteryWordGuesses = 0;
        SNSvars.mysteryWordShard = SNSvars.mysteryWord;
        SNSvars.mode = "mysteryWord";
        SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4)); 
        SNSvars.textArray.push("_".repeat(SNSvars.mysteryWord.length));
      };
      //mystery word game: six guesses allowed, clue counts for two guesses
      if (SNSvars.mode === "mysteryWord" && (/^[a-z]+$/.test(button) || button === "'" || button === 5)) {
        let clueLetter = "";
        if (button === 5) {
          clueLetter = SNSvars.mysteryWordShard[SNSfunctions.randomInt(0,
            SNSvars.mysteryWordShard.length - 1)];
          SNSvars.mysteryWordGuesses += 2;
        }
        else {
          clueLetter = button;
          if (SNSvars.mysteryWordShard.indexOf(button) === -1) {
            SNSvars.mysteryWordGuesses += 1;
          }
        }
        SNSvars.mysteryWordShard = SNSvars.mysteryWordShard.replace(new RegExp(clueLetter, 'g'), "");
        SNSvars.displayedText = SNSvars.mysteryWord.split("").map((e, i, a) => (SNSvars.mysteryWordShard.indexOf(a[i])>-1) ? "_" : e).join("");
        SNSvars.audioArray.push(clueLetter); 
        SNSvars.textArray.push(SNSvars.displayedText); 
        //check for win
        if (SNSvars.mysteryWordGuesses <= 6 && SNSvars.displayedText !== SNSvars.mysteryWord && SNSvars.mysteryWord.indexOf(clueLetter) > -1) { 
          SNSvars.audioArray.push("activity" + SNSfunctions.randomInt(1,4)); 
          SNSvars.textArray.push(SNSvars.displayedText); 
        }
        else if (SNSvars.mysteryWordGuesses > 6 && SNSvars.displayedText !== SNSvars.mysteryWord) { 
          SNSvars.audioArray.push("iwin"); 
          SNSvars.textArray.push(SNSvars.mysteryWord); 
        }
        else if (SNSvars.mysteryWordGuesses <= 6 && SNSvars.displayedText === SNSvars.mysteryWord) { 
          SNSvars.audioArray.push("youwin"); SNSvars.textArray.push(SNSvars.mysteryWord); 
        };
      };
      SNSfunctions.syncOutput(SNSvars,SNSfunctions);
    }
} 
export default SNSfunc;