import React from "react";
import { listPosts } from "graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { ListPostsQuery, OnCreatePostSubscription, Post } from "graphql/api";
import { onCreatePost } from "graphql/subscriptions";
import DeletePost from "components/DeletePost";
import EditPost from "components/EditPost";
import Observable from "zen-observable-ts";

const rowStyle = {
	background: "#f4f4f4",
	padding: "10px",
	border: "1px #ccc dotted",
	margin: "14px"
};

const DisplayPosts = () => {
	const [posts, setPosts] = React.useState<Post[]>([]);

	React.useEffect(() => {
		const getPosts = async (): Promise<void> => {
			const result = (await API.graphql(graphqlOperation(listPosts))) as {
				data: ListPostsQuery;
			};

			setPosts(result.data.listPosts.items);
		};

		const createPostListener = (): (() => void) => {
			const subscription = API.graphql(graphqlOperation(onCreatePost));

			if (subscription instanceof Observable) {
				const sub = subscription.subscribe({
					next: (postData: { value: { data: OnCreatePostSubscription } }) => {
						const newPost = postData.value.data.onCreatePost;
						const prevPosts = posts.filter((post) => post.id !== newPost.id);

						const updatedPosts = [newPost, ...prevPosts];

						setPosts(updatedPosts);
					}
				});

				return () => sub.unsubscribe();
			}
		};

		getPosts();

		return createPostListener();
	}, [posts]);

	if (!posts) return <div>Loading...</div>;

	posts.sort((a, b) => {
		const aDate = new Date(a.createdAt);
		const bDate = new Date(b.createdAt);

		return aDate > bDate ? -1 : 1;
	});

	return (
		<div>
			{posts.map((post) => (
				<div key={post.id} className="posts" style={rowStyle}>
					<h1>{post.postTitle}</h1>
					<span style={{ fontStyle: "italic", color: "#0ca5e297" }}>
						{`Written by: ${post.postOwnerUsername}`}
						{" on "}
						<time style={{ fontStyle: "italic" }}>
							{new Date(post.createdAt).toDateString()}
						</time>
					</span>
					<p>{post.postBody}</p>
					<br />
					<span>
						<DeletePost postId={post.id} />
						<EditPost />
					</span>
				</div>
			))}
		</div>
	);
};

export default DisplayPosts;
