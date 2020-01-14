import React from 'react';
import './App.css';
import { Button, Paper, TextField } from '@material-ui/core';

interface appState {
  serialText: string;
  portOpen: boolean;
  comPort: string;
  baudRate: string;
}

let interval: any;

class App extends React.Component {
  readonly state: Readonly<appState>;
  constructor(props: any) {
    super(props);
    this.state = {
      serialText: '',
      portOpen: false,
      comPort: '',
      baudRate: '',
    };
  }

  render() {
    return <div className="App-header">
      <TextField style={{ margin: '10px' }} variant='outlined' value={this.state.comPort} onChange={this.handleComChange.bind(this)}></TextField>
      <TextField style={{ margin: '10px' }} variant='outlined' value={this.state.baudRate} onChange={this.handleBaudChange.bind(this)}></TextField>
      {!(this.state.portOpen) ?
        <Button style={{ margin: '10px' }} variant='contained' onClick={() => { this.connectToCom(this.state.comPort, this.state.baudRate); }}>Connect</Button> :
        <Button style={{ margin: '10px' }} variant='contained' onClick={() => { this.disconnectFromCom(this.state.comPort); }}>Disconnect</Button>
      }
      <Button style={{ margin: '10px' }} variant='contained' onClick={() => { this.clearTerminal(); }}>Clear Terminal</Button>
      <Paper>
        {this.state.serialText}
      </Paper>
    </div>
  }

  handleComChange(e: any) {
    this.setState({ comPort: e.target.value });
  }

  handleBaudChange(e: any) {
    this.setState({ baudRate: e.target.value });
  }

  disconnectFromCom(comport: string) {
    fetch('http://localhost:4567/serialport', {
      method: 'DELETE',
    })
      .then(response => {
        console.log(response);
        this.setState({ portOpen: false});
        clearInterval(interval);
      })
  }

  connectToCom(comport: string, baudRate: string) {
    fetch('http://localhost:4567/serialport', {
      method: 'POST',
      body: JSON.stringify({ comport, baudRate }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        console.log(data);
        if (data === 'created serialport') {
          this.setState({ portOpen: true });
          interval = setInterval(() => {
            if (this.state.portOpen) {
              this.requestSerialPrint();
            }
          }, 500);
        }
      })
  }

  requestSerialPrint() {
    if (this.state.portOpen) {
      fetch('http://localhost:4567/serialout', {
        method: 'GET',
      })
        .then(response => {
          return response.text();
        })
        .then(data => {
          this.setState({ serialText: data });
        })
    }
  }

  clearTerminal() {
    this.setState({ serialText: '' });
    fetch('http://localhost:4567/serialout', {
      method: 'DELETE',
    })
      .then(response => {
        console.log(response);
      })
  }
}


export default App;
