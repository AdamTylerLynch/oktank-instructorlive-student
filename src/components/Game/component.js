import React, { Component } from 'react';
import { API, graphqlOperation, Auth, Hub } from 'aws-amplify';
import { onCreateQuestion } from '../../graphql/subscriptions';
import Video from '../Video';
import Modal from '../Modal';
import Chat from '../Chat';
import styles from './styles';
import logo from '../../images/oktanklogo.png';

class Game extends Component {
	constructor(props){
		super(props);
		this.state = {
			modalVisible: false,
			modalBackground: "#FFFFFF",
			username: "",
			user: "",
			customState: null,
		};
	}

	componentDidMount(){
		//this.listenForQuestions();

		Hub.listen("auth", ({ payload: { event, data } }) => {
			switch (event) {
			case "signIn":
			  this.setState({ user: data });
			  this.setState({ username: data.signInUserSession.idToken.payload.email });
			  break;
			case "signOut":
			  this.setState({ user: null });
			  break;
			case "customOAuthState":
			  this.setState({ customState: data });
		  }
		});
	
		Auth.currentAuthenticatedUser()
		  .then(user => this.setState({ user }))
		  .catch(() => console.log("Not signed in"));
	}


	askForName = () => {
		return(
			<div className="game-container">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Instructor LIVE!</h1>
				</header>
				<div className="">
					<center>
						<div className="username-prompt">
							<div className="username-prompt-input-container">
							<button onClick={() => Auth.federatedSignIn({provider: 'okta-instructor-live-student'})}>Login with Okta</button>
							</div>
						</div>
					</center>
				</div>
			</div>
		);
	}

	listenForQuestions = () => {
		let self = this;
		API.graphql(
			graphqlOperation(onCreateQuestion)
		).subscribe({
			next: (data) => {
				self.setState({
					question: data.value.data,
					answerAvailable: false,
					questionAvailable: true,
					modalVisible: true,
					buttonsDisabled: false,
					selectedAnswerButton: null
				});
			}
		})
	}



	game = () => {
		if(this.state.questionAvailable && !this.state.answerAvailable)
			return this.question();
		else if(this.state.answerAvailable && !this.state.questionAvailable)
			return this.answer();
		else if(this.state.gameOver)
			if(this.state.winner)
				return this.winner()
			else if(this.state.loser)
				return this.loser();
	}

	render(){
		if(this.state.username == ""){
			return this.askForName();	
		} else {
			return(
				<div className="game-container">
					<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h1 className="App-title">Instructor LIVE! {this.state.username}</h1>
					</header>
					<Video />
					<Chat username={ this.state.username } />
					
					<Modal class={this.state.modalVisible ? "show" : ""} backgroundColor={this.state.modalBackground}>
						{ this.game() }
					</Modal>
				</div>
			);
		}
	}
}

export default Game;