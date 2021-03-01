import React from "react";
import { listPosts } from "graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { ListPostsQuery } from "graphql/api";

const DisplayPosts = () => {
	React.useEffect(() => {
		const getPosts = async () => {
			const result = (await API.graphql(graphqlOperation(listPosts))) as {
				data: ListPostsQuery;
			};

			console.log("All Posts: ", JSON.stringify(result.data.listPosts?.items));
		};

		getPosts();
	}, []);

	return <div>Hello World</div>;
};

export default DisplayPosts;
