import React, { Component }  from 'react';
import { SafeAreaView } from 'react-native';
import SNSsvg from './accessories/SNSsvg';
import SNSstate from './accessories/SNSstate';
import SNSvars from './accessories/SNSvars';
import SNSfunc from './accessories/SNSfunc';
import Sound from 'react-native-sound-player'


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = SNSstate;
    this.vars = SNSvars;
    this.functions = SNSfunc;
  };
  _onFinishedPlayingSubscription = null;
  SNSdisplay = (newState) => { this.setState(newState); };
  syncOutput = (SNSvars,SNSfunctions) => {
    if (SNSvars.audioArray.length > 0) { 
      let snsSound = `s${SNSvars.soundIndex.indexOf(SNSvars.audioArray[0])}`;
      SNSvars.wait = true;
      this.functions.pushOutput(SNSvars.textArray[0],SNSvars,SNSfunctions);
      Sound.playSoundFile(snsSound,'mp3')
    }
    else { 
      SNSvars.wait = false;
    };
  };
  SNSButtonPress = (e) => {
    this.functions.buttonPress(e,this.vars,this.state,this.functions); 
  };
  componentDidMount = () => {
    this.functions.SNSdisplay = this.SNSdisplay;
    this.functions.syncOutput = this.syncOutput;
    this.vars = this.functions.resetVariables(this.vars);
    _onFinishedPlayingSubscription = Sound.addEventListener('FinishedPlaying', ({success}) => {
      Sound.stop();
      SNSvars.textArray.shift();
      SNSvars.audioArray.shift();
      this.functions.syncOutput(SNSvars,this.functions);
    });
  }
  componentWillUnmount = () => {
    _onFinishedPlayingSubscription.remove();
    Sound.stop();
  }
  render() {
  return (
      <SafeAreaView style={{backgroundColor:"#161616"}}>
        <SNSsvg SNSstate={this.state} SNSButtonPress={this.SNSButtonPress} />
      </SafeAreaView>
  );
  }
};
