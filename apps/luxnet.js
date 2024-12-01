export default {
    async init(os) {
        this.os = os;
        this.loggedInUser = null;
        this.networks = ["Network1", "Network2", "Network3", "Network4", "Network5"];
        this.githubRepo = "doetoeri/LuxNet"; // GitHub 레포지토리
        this.githubToken = ""; // 환경 변수로 설정된 토큰
        os.commands["register"] = this.register.bind(this);
        os.commands["login"] = this.login.bind(this);
        os.commands["createpost"] = this.createPost.bind(this);
        os.commands["viewposts"] = this.viewPosts.bind(this);
        os.commands["editpost"] = this.editPost.bind(this);
        os.commands["deletepost"] = this.deletePost.bind(this);
        os.displayMessage("LuxNet* loaded. Use 'register', 'login', 'createpost', 'viewposts', 'editpost', and 'deletepost'.");
    },

    async fetchData(file) {
        const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/${file}`, {
            headers: { Authorization: `token ${this.githubToken}` },
        });
        const data = await response.json();
        return JSON.parse(atob(data.content));
    },

    async updateData(file, content) {
        const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/${file}`, {
            method: "PUT",
            headers: { Authorization: `token ${this.githubToken}` },
            body: JSON.stringify({
                message: `Update ${file}`,
                content: btoa(JSON.stringify(content, null, 2)),
                sha: await this.getSHA(file),
            }),
        });
        return response.ok;
    },

    async getSHA(file) {
        const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/${file}`, {
            headers: { Authorization: `token ${this.githubToken}` },
        });
        const data = await response.json();
        return data.sha;
    },

    async register(args) {
        const [username, password, network] = args;
        if (!username || !password || !network || !this.networks.includes(network)) {
            this.os.displayMessage("Usage: register [username] [password] [network]");
            return;
        }

        const users = await this.fetchData("users.json");
        if (users.find((user) => user.username === username)) {
            this.os.displayMessage("Error: Username already exists.");
            return;
        }

        users.push({ username, password, network });
        await this.updateData("users.json", users);
        this.os.displayMessage(`User '${username}' registered under '${network}'.`);
    },

    async login(args) {
        const [username, password] = args;
        if (!username || !password) {
            this.os.displayMessage("Usage: login [username] [password]");
            return;
        }

        const users = await this.fetchData("users.json");
        const user = users.find((user) => user.username === username && user.password === password);
        if (!user) {
            this.os.displayMessage("Error: Invalid credentials.");
            return;
        }

        this.loggedInUser = user;
        this.os.displayMessage(`User '${username}' logged in. Network: '${user.network}'`);
    },

    async createPost(args) {
        if (!this.loggedInUser) {
            this.os.displayMessage("Error: You must log in first.");
            return;
        }

        const [title, ...content] = args;
        if (!title || content.length === 0) {
            this.os.displayMessage("Usage: createpost [title] [content]");
            return;
        }

        const posts = await this.fetchData(`${this.loggedInUser.network}.json`);
        posts.push({ id: posts.length + 1, title, content: content.join(" "), author: this.loggedInUser.username });
        await this.updateData(`${this.loggedInUser.network}.json`, posts);
        this.os.displayMessage(`Post '${title}' created in '${this.loggedInUser.network}'.`);
    },

    async viewPosts() {
        if (!this.loggedInUser) {
            this.os.displayMessage("Error: You must log in first.");
            return;
        }

        const posts = await this.fetchData(`${this.loggedInUser.network}.json`);
        if (posts.length === 0) {
            this.os.displayMessage(`No posts in '${this.loggedInUser.network}'.`);
            return;
        }

        posts.forEach((post) => {
            this.os.displayMessage(`[${post.id}] ${post.title} by ${post.author}`);
        });
    },

    async editPost(args) {
        if (!this.loggedInUser) {
            this.os.displayMessage("Error: You must log in first.");
            return;
        }

        const [id, ...content] = args;
        if (!id || content.length === 0) {
            this.os.displayMessage("Usage: editpost [id] [new_content]");
            return;
        }

        const posts = await this.fetchData(`${this.loggedInUser.network}.json`);
        const post = posts.find((p) => p.id === parseInt(id) && p.author === this.loggedInUser.username);
        if (!post) {
            this.os.displayMessage("Error: Post not found or unauthorized.");
            return;
        }

        post.content = content.join(" ");
        await this.updateData(`${this.loggedInUser.network}.json`, posts);
        this.os.displayMessage(`Post '${id}' updated.`);
    },

    async deletePost(args) {
        if (!this.loggedInUser) {
            this.os.displayMessage("Error: You must log in first.");
            return;
        }

        const [id] = args;
        if (!id) {
            this.os.displayMessage("Usage: deletepost [id]");
            return;
        }

        const posts = await this.fetchData(`${this.loggedInUser.network}.json`);
        const index = posts.findIndex((p) => p.id === parseInt(id) && p.author === this.loggedInUser.username);
        if (index === -1) {
            this.os.displayMessage("Error: Post not found or unauthorized.");
            return;
        }

        posts.splice(index, 1);
        await this.updateData(`${this.loggedInUser.network}.json`, posts);
        this.os.displayMessage(`Post '${id}' deleted.`);
    },
};
