import React from "react";
import { Post } from "graphql/api";
import { updatePost } from "graphql/mutations";
import { API, graphqlOperation, Auth } from "aws-amplify";

interface EditPostProps {
	post: Post;
}

const EditPost = ({ post: { id, postTitle, postBody } }: EditPostProps) => {
	const [state, setState] = React.useState({
		show: false,
		id: "",
		postOwnerId: "",
		postOwnerUsername: "",
		postTitle: "",
		postBody: "",
		postData: {
			postTitle,
			postBody
		}
	});

	const handleModal = (): void => {
		setState((prev) => ({
			...prev,
			show: !prev.show
		}));

		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	};

	const handleUpdatePost = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();

		const input = {
			id,
			postOwnerId: state.postOwnerId,
			postOwnerUsername: state.postOwnerUsername,
			postTitle: state.postData.postTitle,
			postBody: state.postData.postBody
		};

		await API.graphql(graphqlOperation(updatePost, { input }));

		setState((prev) => ({ ...prev, show: !prev.show }));
	};

	const handleTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setState((prev) => ({
			...prev,
			postData: {
				...prev.postData,
				postTitle: event.target.value
			}
		}));
	};

	const handleBody = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setState((prev) => ({
			...prev,
			postData: {
				...prev.postData,
				postBody: event.target.value
			}
		}));
	};

	React.useEffect(() => {
		const setCurrentUser = async (): Promise<void> => {
			const user = await Auth.currentUserInfo();

			setState((prev) => ({
				...prev,
				postOwnerId: user.attributes.sub,
				postOwnerUsername: user.username
			}));
		};

		setCurrentUser();
	}, []);

	return (
		<>
			{state.show && (
				<div className="modal">
					<button className="close" onClick={handleModal}>
						X
					</button>
					<form
						className="add-post"
						onSubmit={(event) => handleUpdatePost(event)}
					>
						<input
							style={{ fontSize: "19px" }}
							type="text"
							placeholder="Title"
							name="postTitle"
							value={state.postData.postTitle}
							onChange={handleTitle}
						/>
						<input
							style={{ height: "150px", fontSize: "19px" }}
							type="text"
							name="postBody"
							value={state.postData.postBody}
							onChange={handleBody}
						/>
						<button>Update Post</button>
					</form>
				</div>
			)}
			<button onClick={handleModal}>Edit</button>
		</>
	);
};

export default EditPost;
