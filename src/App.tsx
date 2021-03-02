import React from "react";
import DisplayPosts from "components/DisplayPosts";
import CreatePost from "components/CreatePost";
import "./App.css";

function App() {
	return (
		<div className="App">
			<CreatePost />
			<DisplayPosts />
		</div>
	);
}

export default App;
