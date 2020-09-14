import React from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import './App.css';
import alarmSound from './Cool-alarm-tone-notification-sound.mp3';
// import ContentEditable from 'react-contenteditable';
import { CircularProgressbar, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlay,
  faPause,
  faPlus,
  faTimes,
  faCog,
  faPen
} from '@fortawesome/free-solid-svg-icons';

library.add(faPlay, faPause, faPlus, faTimes, faCog, faPen);

let breakTime = 300000;

class PopUp extends React.Component {
  render() {
    return(<div className="popUp">
    <h2>Ready to Resume?</h2>
    <button onClick={this.props.endBreakResume}>yes</button>
    <button onClick={this.props.endBreak}>no</button>
    <audio src={alarmSound} autoPlay loop/>
    </div>);
  }
}

class BreakButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      finished: false,
      time: props.timerLength
    }
    this.startBreak = this.startBreak.bind(this);
    this.convertTime = this.convertTime.bind(this);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    clearInterval(this.stopTimer);
  }
  startBreak() {
    this.props.onStart();
    this.setState({
      running: true,
      start: Date.now(),
      time: this.props.timerLength
    });
    this.timer = setInterval(() => this.setState({
      time: this.props.timerLength - (Date.now() - this.state.start)
    }), 1000);
    this.stopTimer = setTimeout(() => {
      clearInterval(this.timer);
      this.props.onFinish();
      this.setState({
        running: false,
        finished: true
      });
    }, this.props.timerLength);
  }
  convertTime() {
    let min = Math.floor(this.state.time / 60000);
    let sec = ((this.state.time % 60000) / 1000).toFixed(0);
    return min + ":" + (sec < 10 ? '0' : '') + sec;
  }
  render() {
    let popUp = null;
    if(this.state.running) {
      return (
        <CircularProgressbarWithChildren value={this.state.time} maxValue={this.props.timerLength} styles={{path: {strokeLinecap: 'butt'}}}>
        <h3 className="inner">{this.convertTime()}</h3>
        </CircularProgressbarWithChildren>
      );
    } else {
      if(this.state.finished) {
        popUp = <PopUp endBreak={() => this.setState({finished: false})} endBreakResume={() => {
          this.setState({finished: false});
          this.props.onStop();
        }}/>
      }
      return (<>
        <CircularProgressbarWithChildren value={100} styles={{path: {strokeLinecap: 'butt'}}}>
        <h3 className="inner" onClick={this.startBreak}>Take a Break</h3>
        </CircularProgressbarWithChildren>
        {popUp}
      </>);
    }
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hovering: false,
      running: false,
      breakRunning: false,
      time: 0,
      start: 0
    }
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.convertTime = this.convertTime.bind(this);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  startTimer() {
    console.log('start');
    this.setState({
      start: Date.now() - this.state.time,
      running: true
    })
    this.timer = setInterval(() => this.setState({
      time: Date.now() - this.state.start}), 1000);
  }
  stopTimer() {
    console.log('stop');
    this.setState({running: false});
    clearInterval(this.timer);
  }
  resetTimer() {
    this.setState({time: 0});
  }
  convertTime() {
    let hr = Math.floor(this.state.time / 3600000);
    let min = ((this.state.time % 3600000) / 60000).toFixed(0);
    let sec = ((this.state.time % 60000) / 1000).toFixed(0);
    return hr + ':' + (min < 10 ? '0':'') + min + ":" + (sec < 10 ? '0' : '') + sec;
  }
  render() {
    // let deleteBtn = null;
    // if(this.state.hovering) {
    //   deleteBtn = <FontAwesomeIcon icon="times" size="lg" className="delete" onClick={this.props.onDelete}/>
    // }
    // if(this.props.isOpen) {
      return (<div id={this.props.id} className={this.props.isOpen ? "open":"close"}
      onClick={this.props.isOpen ? undefined:this.props.onClick} onMouseEnter={() => this.setState({hovering:true})} onMouseLeave={() => this.setState({hovering:false})}>
        {this.state.hovering &&
          <FontAwesomeIcon icon="times" size="lg" className="delete" onClick={this.props.onDelete}/>}
        {this.props.isOpen &&
          <Button className="reset" onClick={this.resetTimer} text="Clear Timer"/>}
        <h2>{this.props.name}</h2>
        <h1>{this.convertTime()}</h1>
        <div className="buttonHolder">
        {this.props.isOpen &&
          <div className="button">
            <CircularProgressbarWithChildren value={100}>
              <FontAwesomeIcon icon={this.state.running ? "pause":"play"} size="4x" onClick={this.state.running ? this.stopTimer : this.startTimer}/>
            </CircularProgressbarWithChildren>
          </div>}
          {(this.props.isOpen || this.state.breakRunning) &&
            <div className="button">
              <BreakButton timerLength={breakTime}
              onStart={() => {
                this.setState({breakRunning: true});
                this.stopTimer();
              }} onStop={this.startTimer} onFinish={() => {
                this.props.onClick();
                this.setState({breakRunning: false});
              }}/>
          </div>}
        </div>
      </div>);
    // } else {
    //   return (<div id={this.props.id} className="close" onClick={this.props.onClick} onMouseEnter={() => this.setState({hovering:true})} onMouseLeave={() => this.setState({hovering:false})}>
    //       <h2>{this.props.name}</h2>
    //       <h3>{this.convertTime()}</h3>
    //       {this.state.breakRunning && breakBtn}
    //       {deleteBtn}
    //     </div>);
    // }
  }
}

class TimerManager extends React.Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    const { cookies } = props;
    let names = cookies.getAll();
    if(names != undefined) {
      delete names.maxId;
    } else {
      cookies.set('maxId', 0, {path: '/'});
    }
    this.state = {
      maxId: cookies.get('maxId') + 1 || 0,
      timerNames: names || {},
      open: 0,
      addRequested: false
    }
    this.addTimer = this.addTimer.bind(this);
    this.createTimer = this.createTimer.bind(this);
    this.openTimer = this.openTimer.bind(this);
  }

  createTimer() {
    this.setState({addRequested: true});
  }

  addTimer(name) {
    const {cookies} = this.props;
    let newTimerNames = this.state.timerNames;
    let curId = this.state.maxId;
    newTimerNames[curId] = name;
    cookies.set(curId, name, {path: '/'});
    cookies.set('maxId', this.state.maxId, {path: '/'});
    this.setState({
      timerNames: newTimerNames,
      maxId: curId + 1,
      open: curId, //set just added timer to open
      addRequested: false
    });
  }

  openTimer(id) {
    this.setState({
      open: id
    })
  }

  deleteTimer(id) {
    let newTimerNames = this.state.timerNames;
    delete newTimerNames[id];
    this.props.cookies.remove(id, {path: '/'});
    let newOpen = this.state.open;
    if(id == this.state.open) {
      newOpen = Object.keys(this.state.timerNames)[0]; // first id in list
    }
    this.setState({
      open: newOpen,
      timerNames: newTimerNames
    })
  }

  render() {
    let add = null;
    if(Object.keys(this.state.timerNames).length < 10) {
      add = <div className="add" onClick={this.createTimer}>
        <h2><FontAwesomeIcon icon="plus" className="plus"/> Add Timer</h2>
        {this.state.addRequested &&
          <SingleForm type="text" label="Name: " handleSubmit={this.addTimer}/>
        }
      </div>
    }
      return(<div className="manager">
        <SettingMenu/>
        {Object.keys(this.state.timerNames).map((i) => (
          <Timer name={this.state.timerNames[i]} id={i} isOpen={i == this.state.open} key={i} onClick={() => this.openTimer(i)} onDelete={() => this.deleteTimer(i)}/>
        ))}
        {add}
      </div>);
    // }
  }
}

class SettingMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit: false,
      hover: false
    }
    this.updateBreak = this.updateBreak.bind(this);
    this.displayBreak = this.displayBreak.bind(this);
  }
  updateBreak(time) {
    this.setState({
      edit: false
    });
    breakTime = time * 60000; //times 1 min in ms
  }
  displayBreak() {
    return (breakTime / 60000) + ":00";
  }
  render() {
    if(this.state.open) {
      return (<div className="settings edit">
        <FontAwesomeIcon icon="cog" onClick={() => this.setState({open:false, edit:false})}/>
        {!this.state.edit &&
          <h4 onMouseEnter={() => this.setState({hover:true})}
          onMouseLeave={() => this.setState({hover:false})}>
            {this.state.hover &&
            <FontAwesomeIcon icon="pen" onClick={() => this.setState({edit: true})}/>}
            Break Length: {this.displayBreak()}
          </h4>}
        {this.state.edit &&
          <><h4>Break Length:</h4>
          <SingleForm type="number" label=" (min)" after={true} handleSubmit={this.updateBreak}/></>}
      </div>);
    } else {
      return (<div className="settings">
        <FontAwesomeIcon icon="cog" onClick={() => this.setState({open: true})}/>
      </div>);
    }
  }
}

class SingleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    this.props.handleSubmit(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          {!this.props.after && this.props.label}
          <input type={this.props.type} value={this.state.value} onChange={this.handleChange} />
          {this.props.after && this.props.label}
        </label>
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHover: false
    }
  }
  render() {
    return(<button className={this.props.className} onClick={this.props.onClick} onMouseEnter={()=> this.setState({isHover: true})} onMouseLeave={() => this.setState({isHoever: false})}>{this.props.text}</button>)
  }
}

// class App extends React.Component {
//   static propTypes = {
//     cookies: instanceOf(Cookies).isRequired
//   };
//   // // constructor(props) {
//   // //   super(props);
//   // //   const { cookies } = this.props;
//   // // }
//   // componentDidMount() {
//   //   const { cookies } = this.props;
//   //   cookies.set('test', 'pls work', {path: '/'});
//   //   console.log('attemping to set');
//   // }
//   render() {
//     // console.log(this.props.cookies.get('test'));
//     return (withCookies(<TimerManager/>));
//   }
// }

export default withCookies(TimerManager);
