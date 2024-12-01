export default {
    async init(os) {
        os.registerCommand("register", (args) => this.register(args, os));
        os.registerCommand("login", (args) => this.login(args, os));
        os.registerCommand("createpost", (args) => this.createPost(args, os));
        os.registerCommand("viewposts", (args) => this.viewPosts(args, os));
        os.registerCommand("editpost", (args) => this.editPost(args, os));
        os.registerCommand("deletepost", (args) => this.deletePost(args, os));

        os.displayMessage("LuxNet Module loaded. Available commands: register, login, createpost, viewposts, editpost, deletepost.");
    },

    async register(args, os) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: register [username] [password]");
        }
        return os.displayMessage(`Registered user '${username}' successfully.`);
    },

    async login(args, os) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: login [username] [password]");
        }
        return os.displayMessage(`Login successful for user '${username}'.`);
    },

    async createPost(args, os) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            return os.displayMessage("Usage: createpost [title] [content]");
        }
        return os.displayMessage(`Post '${title}' created successfully.`);
    },

    async viewPosts(args, os) {
        return os.displayMessage("No posts available.");
    },
};
