import React from 'react';
// import Napster from './napster';
import './App.css';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      access_token: '',
      refresh_token: '',
      tracks: []
    };
  }

  componentDidMount() {
    const detail_URL = new URL(window.location);
    const currentURL = detail_URL.href;
    const API_KEY = 'YzI4ZTZjODUtY2MxMS00YjI1LWE4MDQtMmRiYTNhOTRmOTM4';
    const API_SECRET = 'MjQ5ZTI0MWMtMzgxYS00ODU3LWE4NDItOTRkMmM2OWU2YTA5';
    console.log('URL', detail_URL);


    if (detail_URL.search === '') {
      window.location = `https://api.napster.com/oauth/authorize?client_id=${API_KEY}&redirect_uri=${currentURL}&response_type=code`;
    } else if (detail_URL.search.includes('code')) {
      const code = detail_URL.search.substring(6);
      fetch(`https://api.napster.com/oauth/access_token?client_id=${API_KEY}&client_secret=${API_SECRET}&response_type=code&grant_type=authorization_code&redirect_uri=${currentURL}&code=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(result => {
        return result.json();
      })
      .then(result => {
        this.setState({
          access_token: result.access_token,
          refresh_token: result.refresh_token
        })
        console.log(this.state);
      })
      .then(result => {
        return fetch('https://api.napster.com/v2.2/tracks/top?limit=10', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.state.access_token}`,
            'content-type': 'application/json'
          }
        })
        .then(response => {
          return response.json();
        })
        .then(response => {
          response.tracks.map((track) => (
            fetch(`https://api.napster.com/v2.2/albums/${track.albumId}/images`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${this.state.access_token}`,
                'content-type': 'application/json'
              }
            })
            .then(answer => {
              return answer.json();
            })
            .then(answer => {
              this.setState({ tracks: [...this.state.tracks, {id: track.id, name: track.name, artistName: track.artistName, previewURL: track.previewURL, image: answer.images[0].url}]})
              console.log(this.state.tracks);
            })
          ))
        })
      })
    }
  }

  render() {
    const songList = this.state.tracks.map((track) => (

      <li key={track.id} className="track">
        <img src={track.image} alt="Album Art"></img>
        <p className="track-name">{track.name}</p>
        <p className="artist-name">{track.artistName}</p>
        <audio controls>
          <source src={track.previewURL} type="audio/mpeg"/>
        </audio>
      </li>
    ));

    return (
      <div className="App">
        <header className="App-header">
          <h1>Fiilpp's napster.js React App</h1>
          <h3>Check Out Top Hits of Today!</h3>
          <ul>
            {songList}
          </ul>
        </header>
      </div>
    );
  }
}
