import React, { Component }  from 'react';
import { SafeAreaView } from 'react-native';
import SNSsvg from './accessories/SNSsvg';
import SNSstate from './accessories/SNSstate';
import SNSvars from './accessories/SNSvars';
import SNSfunc from './accessories/SNSfunc';
import SNSaudio from './accessories/sns96-mono.mp3';
import Sound from 'react-native-sound';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = SNSstate;
    this.vars = SNSvars;
    this.audioElement = new Sound(SNSaudio);
    this.timer1 = undefined;
    this.functions = SNSfunc;
  };
  SNSdisplay = (newState) => { this.setState(newState); };
  syncOutput = (SNSvars,SNSstate,SNSfunctions) => {
    if (SNSvars.audioArray.length > 0) { 
      SNSvars.wait = true;
      this.functions.pushOutput(SNSvars.textArray[0],SNSvars,SNSfunctions);
      const startTime = SNSvars.soundIndex[SNSvars.soundIndex.indexOf(SNSvars.audioArray[0])+1];
      const duration = SNSvars.soundIndex[SNSvars.soundIndex.indexOf(SNSvars.audioArray[0])+2];
      this.audioElement.setCurrentTime(startTime);
      this.audioElement.play();
      //setTimeout has some precision problems; look into alternatives
      this.timer1 = setTimeout(function() { 
        SNSfunctions.syncOutput(SNSvars,SNSstate,SNSfunctions);
      },duration);
      SNSvars.textArray.shift();
      SNSvars.audioArray.shift();
    }
    else { 
      SNSvars.wait = false;
      this.audioElement.pause() 
    };
  };
  SNSButtonPress = (e) => {
    this.functions.buttonPress(e,this.vars,this.state,this.functions); 
  };
  componentDidMount = () => {
    this.functions.SNSdisplay = this.SNSdisplay;
    this.functions.syncOutput = this.syncOutput;
    this.vars = this.functions.resetVariables(this.vars);
  }
  componentWillUnmount = () => {
    this.audioElement.pause();
    clearTimeout(this.timer1);
  }
  render() {
  return (
      <SafeAreaView style={{backgroundColor:"#161616"}}>
        <SNSsvg SNSstate={this.state} SNSButtonPress={this.SNSButtonPress} />
      </SafeAreaView>
  );
  }
};
