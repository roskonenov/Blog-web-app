export default function authorizeEditPost(blog, username) {
    if (!blog) {
        return {
            redirectTo: "/add-post",
            flash: {
                type: "danger",
                message: "The blog post you are trying to edit was not found. Please choose an existing post or create a new one."
            }
        };
    }

    if (blog.user !== username) {
        return {
            redirectTo: `/my-blogs/${blog.id}`,
            flash: {
                type: "danger",
                message: "You are not allowed to edit this post!"
            }
        };
    }

    return null;
}
