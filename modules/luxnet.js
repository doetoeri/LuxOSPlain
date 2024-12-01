export default {
    async init(os) {
        os.registerCommand("register", this.register.bind(this));
        os.registerCommand("login", this.login.bind(this));
        os.registerCommand("createpost", this.createPost.bind(this));
        os.registerCommand("viewposts", this.viewPosts.bind(this));
        os.registerCommand("editpost", this.editPost.bind(this));
        os.registerCommand("deletepost", this.deletePost.bind(this));
        os.displayMessage("LuxNet Module loaded. Available commands: register, login, createpost, viewposts, editpost, deletepost.");
    },

    async register(args) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: register [username] [password]");
        }
        const response = await this.sendRequest("users.json", (users) => {
            if (users.some(user => user.username === username)) {
                throw new Error("Username already exists.");
            }
            users.push({ username, password });
            return users;
        });
        os.displayMessage(response || "Registration successful.");
    },

    async login(args) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: login [username] [password]");
        }
        const users = await this.readFile("users.json");
        const user = users.find(user => user.username === username && user.password === password);
        os.displayMessage(user ? "Login successful." : "Invalid username or password.");
    },

    async createPost(args) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            return os.displayMessage("Usage: createpost [title] [content]");
        }
        const response = await this.sendRequest("posts.json", (posts) => {
            posts.push({ id: posts.length + 1, title, content: content.join(" "), author: "admin" });
            return posts;
        });
        os.displayMessage(response || "Post created successfully.");
    },

    async viewPosts() {
        const posts = await this.readFile("posts.json");
        if (posts.length === 0) {
            return os.displayMessage("No posts available.");
        }
        posts.forEach(post => os.displayMessage(`[${post.id}] ${post.title} by ${post.author}`));
    },

    async editPost(args) {
        const [postId, newTitle, ...newContent] = args;
        if (!postId || !newTitle || !newContent.length) {
            return os.displayMessage("Usage: editpost [postId] [newTitle] [newContent]");
        }
        const response = await this.sendRequest("posts.json", (posts) => {
            const post = posts.find(post => post.id === parseInt(postId, 10));
            if (!post) {
                throw new Error("Post not found.");
            }
            post.title = newTitle;
            post.content = newContent.join(" ");
            return posts;
        });
        os.displayMessage(response || "Post edited successfully.");
    },

    async deletePost(args) {
        const [postId] = args;
        if (!postId) {
            return os.displayMessage("Usage: deletepost [postId]");
        }
        const response = await this.sendRequest("posts.json", (posts) => {
            const filteredPosts = posts.filter(post => post.id !== parseInt(postId, 10));
            if (filteredPosts.length === posts.length) {
                throw new Error("Post not found.");
            }
            return filteredPosts;
        });
        os.displayMessage(response || "Post deleted successfully.");
    },

    async readFile(filename) {
        const response = await fetch(`https://api.github.com/repos/doetoeri/LuxNet/contents/${filename}`, {
            headers: { Authorization: `token ${process.env.LUXNET_TOKEN}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
        const data = await response.json();
        return JSON.parse(atob(data.content));
    },

    async sendRequest(filename, modifyCallback) {
        const data = await this.readFile(filename);
        const updatedData = modifyCallback(data);
        const response = await fetch(`https://api.github.com/repos/doetoeri/LuxNet/contents/${filename}`, {
            method: "PUT",
            headers: { Authorization: `token ${process.env.LUXNET_TOKEN}` },
            body: JSON.stringify({
                message: `Update ${filename}`,
                content: btoa(JSON.stringify(updatedData, null, 2)),
                sha: (await this.readFile(filename)).sha,
            }),
        });
        if (!response.ok) throw new Error(`Failed to update ${filename}`);
        return null;
    },
};
