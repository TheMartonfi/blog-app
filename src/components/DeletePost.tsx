import React from "react";
import { deletePost } from "graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

interface DeletePostProps {
	postId: string;
}

const handleDeletePost = async (postId: string): Promise<void> => {
	const input = {
		id: postId
	};

	await API.graphql(graphqlOperation(deletePost, { input }));
};

const DeletePost = ({ postId }: DeletePostProps) => {
	return <button onClick={() => handleDeletePost(postId)}>Delete</button>;
};

export default DeletePost;
