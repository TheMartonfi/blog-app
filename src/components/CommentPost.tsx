import React from "react";
import { Comment } from "graphql/api";

interface CommentPostProps {
	comment: Comment;
}

const CommentPost = ({
	comment: { content, commentOwnerUsername, createdAt }
}: CommentPostProps) => {
	return (
		<div className="comment">
			<span style={{ fontStyle: "italic", color: "#0ca5e297" }}>
				{"Comment by: "} {commentOwnerUsername}
				{" on "}
				<time style={{ fontStyle: "italic" }}>
					{" "}
					{new Date(createdAt).toDateString()}
				</time>
			</span>
			<p>{content}</p>
		</div>
	);
};

export default CommentPost;
