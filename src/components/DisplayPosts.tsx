import React from "react";
import { listPosts } from "graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { ListPostsQuery } from "graphql/api";
import DeletePost from "components/DeletePost";
import EditPost from "components/EditPost";

const rowStyle = {
	background: "#f4f4f4",
	padding: "10px",
	border: "1px #ccc dotted",
	margin: "14px"
};

const DisplayPosts = () => {
	const [posts, setPosts] = React.useState<ListPostsQuery>();

	React.useEffect(() => {
		const getPosts = async () => {
			const result = (await API.graphql(graphqlOperation(listPosts))) as {
				data: ListPostsQuery;
			};

			setPosts(result.data);
		};

		getPosts();
	}, []);

	if (!posts) return <div>Loading...</div>;

	return (
		<div>
			{posts.listPosts.items.map((post) => (
				<div key={post.id} className="posts" style={rowStyle}>
					<h1>{post.postTitle}</h1>
					<span style={{ fontStyle: "italic", color: "#0ca5e297" }}>
						{`Wrote by: ${post.postOwnerUsername}`}
						{" on "}
						<time style={{ fontStyle: "italic" }}>
							{new Date(post.createdAt).toDateString()}
						</time>
					</span>
					<p>{post.postBody}</p>
					<br />
					<span>
						<DeletePost />
						<EditPost />
					</span>
				</div>
			))}
		</div>
	);
};

export default DisplayPosts;
