import React from "react";
import { createComment } from "graphql/mutations";
import { API, graphqlOperation, Auth } from "aws-amplify";

interface CreateCommentPostProps {
	postId: string;
}

const CreateCommentPost = ({ postId }: CreateCommentPostProps) => {
	const [state, setState] = React.useState({
		commentOwnerId: "",
		commentOwnerUsername: "",
		content: ""
	});

	const handleChangeContent = (
		event: React.ChangeEvent<HTMLTextAreaElement>
	): void => setState((prev) => ({ ...prev, content: event.target.value }));

	const handleAddComment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const input = {
			commentPostId: postId,
			commentOwnerId: state.commentOwnerId,
			commentOwnerUsername: state.commentOwnerUsername,
			content: state.content,
			createdAt: new Date().toISOString()
		};

		await API.graphql(graphqlOperation(createComment, { input }));

		setState((prev) => ({ ...prev, content: "" }));
	};

	React.useEffect(() => {
		const setCurrentUser = async (): Promise<void> => {
			const user = await Auth.currentUserInfo();

			setState((prev) => ({
				...prev,
				commentOwnerId: user.attributes.sub,
				commentOwnerUsername: user.username
			}));
		};

		setCurrentUser();
	}, []);

	return (
		<div>
			<form className="add-comment" onSubmit={handleAddComment}>
				<textarea
					name="content"
					placeholder="Add Your Comment..."
					rows={3}
					cols={40}
					required
					value={state.content}
					onChange={handleChangeContent}
				/>
				<input
					className="btn"
					type="submit"
					style={{ fontSize: "19px" }}
					value="Add Comment"
				/>
			</form>
		</div>
	);
};

export default CreateCommentPost;
