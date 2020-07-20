import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { print as gqlToString } from 'graphql/language';
import { onCreateChatMessage } from '../../graphql/subscriptions';
import { createChatMessage } from '../../graphql/mutations';
import { chatMessagesByCourse } from '../../graphql/queries';
import JsonTable from 'ts-react-json-table';


class Chat extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			chatMessages: [],
			inputMessage: '',
			username: '',
			course: 3
		};

		this.handleInputChange = this.handleInputChange.bind(this)
	}

	tableSettings = {
		header: false,
		cellClass: (currentClass, columnKey, rowData) => {
			if(columnKey === 'createdAt'){
				return 'columnChatsTime';
			}else if(columnKey === 'message'){
				return 'columnChatsMessage';
			}else if(columnKey === 'username'){
				return 'columnChatsUsername';
			}
		}
	}

	tableColumns = [{
		key: 'username',
		label: 'username:'
	}, {
		key: 'message',
		label: 'message',
	}, {
		key: 'createdAt',
		label: 'createdAt',
		cell: (row, columnKey) => {
			return new Date(row[columnKey]).toLocaleTimeString('en-US');
		}
	}];

	handleInputChange(event) {
		this.setState({inputMessage: event.target.value});
	}

	componentDidMount(){
		this.listenForChatMessages();
		this.loadChatMessages();
		this.setState({username: this.props.username});
	}

	loadChatMessages = () => {
		let self = this;

		API.graphql(
			graphqlOperation(chatMessagesByCourse, { course: this.state.course })
		).then(response => {
			
			let chats = response.data.chatMessagesByCourse.items;
			
			self.setState({
				chatMessages: chats
			});

			console.log(self.state.chatMessages);
		});
	}

	listenForChatMessages = () => {
		let self = this;
		API.graphql(
			graphqlOperation(onCreateChatMessage)
		).subscribe({
			next: (data) => {

				let chats = this.state.chatMessages;
				let incomingChat = data.value.data.onCreateChatMessage;
				
				//verify this message is for the right ccourse
				if(incomingChat.course === this.state.course){
					chats.push(incomingChat);

					self.setState({
						chatMessages: chats
					});
					console.log(self.state.chatMessages);
				}else{
					console.log("not for this course");
				}
			}
		})
	}

	//Catch the <enter> key
	evalKeyPress = (event) => {
		if (event.keyCode === 13) {
            this.onSendCell();
        }
	}

	onSendCell = (event) => {
		if (this.state.inputMessage.length > 0) {
			const message = {
				input: {
					username: this.state.username,
					message: this.state.inputMessage,
					course: this.state.course
				}
			}

			API.graphql(
				graphqlOperation(createChatMessage, message)).then(response => {
				
				console.log(response.data.createChatMessage);

				this.setState({
					inputMessage: ''
				});
			}).catch((err) => {
				console.log("err: ", err);
			});
			;
		} 
	}

	render() {
		return (
			<div className="containerChat">
				<JsonTable rows={this.state.chatMessages} columns={this.tableColumns} settings={this.tableSettings} className="tableChats" />
				<div className="controllerChat"><input type="text" name="chatMessageInput" className="textChatInput" value={this.state.inputMessage} onChange={this.handleInputChange}  onKeyDown={(e) => this.evalKeyPress(e) } /><button onClick={this.onSendCell}>Send</button></div>
			</div>
		);
	}
}


export default Chat;