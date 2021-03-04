import React from "react";

interface UserWhoLikedPostProps {
	postLikedBy: string[];
}

const UserWhoLikedPost = ({ postLikedBy }: UserWhoLikedPostProps) => {
	return (
		<>
			{postLikedBy.map((user) => (
				<div key={user}>
					<span style={{ fontStyle: "bold", color: "#ged" }}>{user}</span>
				</div>
			))}
		</>
	);
};

export default UserWhoLikedPost;
