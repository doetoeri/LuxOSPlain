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

    async register(args, os) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: register [username] [password]");
        }
        try {
            const users = await this.readFile("users.json");
            if (users.some(user => user.username === username)) {
                return os.displayMessage("Error: Username already exists.");
            }
            users.push({ username, password });
            await this.writeFile("users.json", users);
            os.displayMessage("Registration successful.");
        } catch (error) {
            os.displayMessage(`Error registering user: ${error.message}`);
        }
    },

    async login(args, os) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: login [username] [password]");
        }
        try {
            const users = await this.readFile("users.json");
            const user = users.find(user => user.username === username && user.password === password);
            os.displayMessage(user ? "Login successful." : "Invalid username or password.");
        } catch (error) {
            os.displayMessage(`Error logging in: ${error.message}`);
        }
    },

    async createPost(args, os) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            return os.displayMessage("Usage: createpost [title] [content]");
        }
        try {
            const posts = await this.readFile("posts.json");
            posts.push({ id: posts.length + 1, title, content: content.join(" "), author: "admin" });
            await this.writeFile("posts.json", posts);
            os.displayMessage("Post created successfully.");
        } catch (error) {
            os.displayMessage(`Error creating post: ${error.message}`);
        }
    },

    async viewPosts(args, os) {
        try {
            const posts = await this.readFile("posts.json");
            if (posts.length === 0) {
                return os.displayMessage("No posts available.");
            }
            posts.forEach(post => os.displayMessage(`[${post.id}] ${post.title} by ${post.author}`));
        } catch (error) {
            os.displayMessage(`Error viewing posts: ${error.message}`);
        }
    },

    async readFile(filename) {
        const response = await fetch(`https://api.github.com/repos/doetoeri/LuxNet/contents/${filename}`, {
            headers: { Authorization: `token ${process.env.LUXNET_TOKEN}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
        const data = await response.json();
        return JSON.parse(atob(data.content));
    },

    async writeFile(filename, data) {
        const content = btoa(JSON.stringify(data, null, 2));
        const response = await fetch(`https://api.github.com/repos/doetoeri/LuxNet/contents/${filename}`, {
            method: "PUT",
            headers: { Authorization: `token ${process.env.LUXNET_TOKEN}` },
            body: JSON.stringify({
                message: `Update ${filename}`,
                content,
            }),
        });
        if (!response.ok) throw new Error(`Failed to update ${filename}: ${response.statusText}`);
    },
};
