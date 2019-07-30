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
    this.timer = null;
  };
  _onFinishedLoadingFileSubscription = null;
  SNSdisplay = (newState) => { this.setState(newState); };
  syncOutput = (SNSvars,SNSfunctions) => {
    if (SNSvars.audioArray.length > 0) { 
      let snsSound = `s${SNSvars.soundIndex.indexOf(SNSvars.audioArray[0])}`;
      SNSvars.wait = true;
      this.functions.pushOutput(SNSvars.textArray[0],SNSvars,SNSfunctions);
      Sound.playSoundFile(snsSound,'mp3');
      
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
    _onFinishedLoadingFileSubscription = Sound.addEventListener('FinishedLoadingFile', async ({ success, name, type }) => {
      try {
        const info = await Sound.getInfo();
        const timeout =  (info.duration - info.currentTime -  0.15)*1000;  //this method reduces the delay between sequentially played sounds - it's hacky, but I haven't found a solid alternative
        SNSvars.textArray.shift();
        SNSvars.audioArray.shift();
        this.timer = setTimeout(this.functions.syncOutput,timeout,SNSvars,this.functions);
      } catch (e) {
        SNSvars.textArray.shift();
        SNSvars.audioArray.shift();
        this.functions.syncOutput(SNSvars,this.functions);
      }
    })
  }
  componentWillUnmount = () => {
    _onFinishedLoadingSubscription.remove();
    clearTimeout(this.timer);
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
