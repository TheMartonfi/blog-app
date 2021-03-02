import React from "react";
import { createPost } from "graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

const CreatePost = () => {
	const [state, setState] = React.useState({
		postOwnerId: "",
		postOwnerUsername: "",
		postTitle: "",
		postBody: ""
	});

	const handleAddPost = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const input = {
			postOwnerId: state.postOwnerId,
			postOwnerUsername: state.postOwnerUsername,
			postTitle: state.postTitle,
			postBody: state.postBody,
			createdAt: new Date().toISOString()
		};

		await API.graphql(graphqlOperation(createPost, { input }));

		setState((prev) => ({ ...prev, postTitle: "", postBody: "" }));
	};

	const handleChangePost = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) =>
		setState((prev) => ({
			...prev,
			[event.target.name]: event.target.value
		}));

	React.useEffect(() => {
		// Todo
	}, []);

	return (
		<form className="add-post" onSubmit={handleAddPost}>
			<input
				style={{ font: "19px" }}
				type="text"
				placeholder="Title"
				name="postTitle"
				required
				value={state.postTitle}
				onChange={handleChangePost}
			/>
			<textarea
				placeholder="New Blog Post"
				name="postBody"
				rows={3}
				cols={40}
				required
				value={state.postBody}
				onChange={handleChangePost}
			/>
			<input className="btn" type="submit" style={{ fontSize: "19px" }} />
		</form>
	);
};

export default CreatePost;