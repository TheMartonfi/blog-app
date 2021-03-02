import React from "react";
import DisplayPosts from "components/DisplayPosts";
import CreatePost from "components/CreatePost";
import { withAuthenticator } from "aws-amplify-react";
import "@aws-amplify/ui/dist/style.css";
import "./App.css";

function App() {
	return (
		<div className="App">
			<CreatePost />
			<DisplayPosts />
		</div>
	);
}

export default withAuthenticator(App, true);
