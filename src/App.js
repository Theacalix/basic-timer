import React from 'react';
import logo from './logo.svg';
import './App.css';
// import ContentEditable from 'react-contenteditable';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlay,
  faPause,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

library.add(faPlay, faPause, faPlus);

// const defaultName = 'label your timer...';

class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      running: false,
      time: 0,
      start: 0
    }
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
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
  render() {
    if(this.props.isOpen) {
      return (<div id={this.props.id} className="open">
      <h2>{this.props.name}</h2>
        <h1>{this.state.time}</h1>
        <button onClick={this.state.running ? this.stopTimer : this.startTimer}>
          <FontAwesomeIcon icon={this.state.running ? "pause":"play"}/>
        </button>
        <button onClick={this.resetTimer}>reset</button>
      </div>);
    } else {
      return (<div id={this.props.id} className="closed">
          <h2>{this.props.name}</h2>
          <h3>{this.state.time}</h3>
        </div>);
    }
  }
}

class NameForm extends React.Component {
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
          {this.props.label}
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}

class TimerManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timerNames: [],
      open: 0,
      addRequested: false
    }
    this.addTimer = this.addTimer.bind(this);
    this.createTimer = this.createTimer.bind(this);
  }

  createTimer() {
    this.setState({addRequested: true});
  }

  addTimer(name) {
    let newTimerNames = this.state.timerNames.concat(name);
    this.setState({
      timerNames: newTimerNames,
      open: newTimerNames.length - 1, //set just added timer to open
      addRequested: false
    });
  }

  render() {
    if(this.state.timerNames == 0) {
      return (<div className="manager">
          <NameForm label="Timer Name:" handleSubmit={this.addTimer}/>
      </div>);
    } else {
      return(<div className="manager">
        {this.state.timerNames.map((timer, i) => (
          <Timer name={timer} id={i} isOpen={true} key={i}/>
        ))}
        <div className="add" onClick={this.createTimer}>
          <FontAwesomeIcon icon="plus"/>
          <h2>Add Timer</h2>
          {this.state.addRequested &&
            <NameForm label="Timer Name:" handleSubmit={this.addTimer}/>
          }
        </div>
      </div>);
    }
  }
}

function App() {
  return (<TimerManager/>);
}

export default App;
