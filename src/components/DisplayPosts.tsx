import React from "react";
import { listPosts } from "graphql/queries";
import { API, graphqlOperation, Auth } from "aws-amplify";
import {
	ListPostsQuery,
	OnCreatePostSubscription,
	OnUpdatePostSubscription,
	OnDeletePostSubscription,
	OnCreateCommentSubscription,
	OnCreateLikeSubscription,
	CreateLikeMutation,
	Post
} from "graphql/api";
import {
	onCreatePost,
	onUpdatePost,
	onDeletePost,
	onCreateComment,
	onCreateLike
} from "graphql/subscriptions";
import { createLike } from "graphql/mutations";
import DeletePost from "components/DeletePost";
import EditPost from "components/EditPost";
import CreateCommentPost from "components/CreateCommentPost";
import CommentPost from "components/CommentPost";
import { FaThumbsUp } from "react-icons/fa";
import Observable from "zen-observable-ts";

const rowStyle = {
	background: "#f4f4f4",
	padding: "10px",
	border: "1px #ccc dotted",
	margin: "14px"
};

const DisplayPosts = () => {
	const [posts, setPosts] = React.useState<Post[]>();
	const [state, setState] = React.useState({
		ownerId: "",
		ownerUsername: "",
		errorMessage: "",
		postLikedBy: [],
		isHovering: false
	});

	const likedPost = (postId: string): boolean => {
		for (const post of posts) {
			if (post.id === postId) {
				if (post.postOwnerId === state.ownerId) return true;
				for (const like of post.likes.items) {
					if (like.likeOwnerId === state.ownerId) return true;
				}
			}
		}
		return false;
	};

	const handleLike = async (postId: string): Promise<void> => {
		if (likedPost(postId))
			return setState((prev) => ({
				...prev,
				errorMessage: "Can't like your own post."
			}));

		const input = {
			numberLikes: 1,
			likeOwnerId: state.ownerId,
			likeOwnerUsername: state.ownerUsername,
			likePostId: postId
		};

		try {
			const result = (await API.graphql(
				graphqlOperation(createLike, { input })
			)) as { data: CreateLikeMutation };

			console.log("Liked: ", result.data);
		} catch (e) {
			console.error(e);
		}
	};

	React.useEffect(() => {
		const setCurrentUser = async (): Promise<void> => {
			const user = await Auth.currentUserInfo();

			setState((prev) => ({
				...prev,
				ownerId: user.attributes.sub,
				ownerUsername: user.username
			}));
		};

		const getPosts = async (): Promise<void> => {
			const result = (await API.graphql(graphqlOperation(listPosts))) as {
				data: ListPostsQuery;
			};

			setPosts(result.data.listPosts.items);
		};

		const createPostListener = (): (() => void) | undefined => {
			const subscription = API.graphql(graphqlOperation(onCreatePost));

			if (subscription instanceof Observable) {
				const sub = subscription.subscribe({
					next: (postData: { value: { data: OnCreatePostSubscription } }) => {
						const newPost = postData.value.data.onCreatePost;
						setPosts((prev) => [newPost, ...prev]);
					}
				});

				return (): void => sub.unsubscribe();
			}
		};

		const updatePostListener = (): (() => void) | undefined => {
			const subscription = API.graphql(graphqlOperation(onUpdatePost));

			if (subscription instanceof Observable) {
				const sub = subscription.subscribe({
					next: (postData: { value: { data: OnUpdatePostSubscription } }) => {
						const updatedPost = postData.value.data.onUpdatePost;

						setPosts((prev) => {
							const index = prev.findIndex(
								(post) => post.id === updatedPost.id
							);

							return [
								...prev.slice(0, index),
								updatedPost,
								...prev.slice(index + 1)
							];
						});
					}
				});

				return (): void => sub.unsubscribe();
			}
		};

		const deletePostListener = (): (() => void) | undefined => {
			const subscription = API.graphql(graphqlOperation(onDeletePost));

			if (subscription instanceof Observable) {
				const sub = subscription.subscribe({
					next: (postData: { value: { data: OnDeletePostSubscription } }) => {
						const deletedPost = postData.value.data.onDeletePost;

						setPosts((prev) =>
							prev.filter((post) => post.id !== deletedPost.id)
						);
					}
				});

				return (): void => sub.unsubscribe();
			}
		};

		const createCommentListener = (): (() => void) | undefined => {
			const subscription = API.graphql(graphqlOperation(onCreateComment));

			if (subscription instanceof Observable) {
				const sub = subscription.subscribe({
					next: (commentData: {
						value: { data: OnCreateCommentSubscription };
					}) => {
						const createdComment = commentData.value.data.onCreateComment;

						setPosts((prev) => {
							const prevCopy = [...prev];

							prevCopy.forEach((post) => {
								if (createdComment.post.id === post.id) {
									post.comments.items.push(createdComment);
								}
							});

							return prevCopy;
						});
					}
				});

				return (): void => sub.unsubscribe();
			}
		};

		const createLikeListener = (): (() => void) | undefined => {
			const subscription = API.graphql(graphqlOperation(onCreateLike));

			if (subscription instanceof Observable) {
				const sub = subscription.subscribe({
					next: (postData: { value: { data: OnCreateLikeSubscription } }) => {
						const createdLike = postData.value.data.onCreateLike;
						setPosts((prev) => {
							const prevCopy = [...prev];

							prevCopy.forEach((post) => {
								if (createdLike.post.id === post.id) {
									post.likes.items.push(createdLike);
								}
							});

							return prevCopy;
						});
					}
				});

				return (): void => sub.unsubscribe();
			}
		};

		setCurrentUser();
		getPosts();

		const unsubscribeCreatePost = createPostListener();
		const unsubscribeUpdatePost = updatePostListener();
		const unsubscribeDeletePost = deletePostListener();
		const unsubscribeCreateComment = createCommentListener();
		const unsubscribeCreateLike = createLikeListener();

		const cleanup = (): void => {
			unsubscribeCreatePost();
			unsubscribeUpdatePost();
			unsubscribeDeletePost();
			unsubscribeCreateComment();
			unsubscribeCreateLike();
		};

		return cleanup;
		// eslint-disable-next-line
	}, []);

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
						{post.postOwnerId === state.ownerId && (
							<>
								<DeletePost postId={post.id} />
								<EditPost post={post} />
							</>
						)}
						<span>
							<p className="alert">
								{post.postOwnerId === state.ownerId && state.errorMessage}
							</p>
							<p onClick={() => handleLike(post.id)}>
								<FaThumbsUp /> {post.likes.items.length}
							</p>
						</span>
					</span>
					<span>
						<CreateCommentPost postId={post.id} />
						{post.comments.items.length > 0 && (
							<span style={{ fontSize: "19px", color: "gray" }}>Comments:</span>
						)}
						{post.comments.items.map((comment, index) => (
							<CommentPost key={index} comment={comment} />
						))}
					</span>
				</div>
			))}
		</div>
	);
};

export default DisplayPosts;
