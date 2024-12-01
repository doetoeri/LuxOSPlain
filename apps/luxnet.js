export default {
    async run(os) {
        this.os = os;
        this.loggedInUser = null;

        this.githubRepo = "doetoeri/LuxOSPlain"; // GitHub 레포지토리
        this.githubToken = ""; // 환경 변수로 관리된 토큰

        os.displayMessage("LuxNet* started. Use 'register', 'login', 'createpost', 'viewposts', 'editpost', or 'deletepost'.");
        
        os.commands["register"] = this.register.bind(this);
        os.commands["login"] = this.login.bind(this);
        os.commands["createpost"] = this.createPost.bind(this);
        os.commands["viewposts"] = this.viewPosts.bind(this);
        os.commands["editpost"] = this.editPost.bind(this);
        os.commands["deletepost"] = this.deletePost.bind(this);
    },

    async fetchData() {
        const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/networks.json`, {
            headers: { Authorization: `token ${this.githubToken}` },
        });
        const data = await response.json();
        return JSON.parse(atob(data.content));
    },

    async updateData(content) {
        const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/networks.json`, {
            method: "PUT",
            headers: { Authorization: `token ${this.githubToken}` },
            body: JSON.stringify({
                message: "Update networks.json",
                content: btoa(JSON.stringify(content, null, 2)),
                sha: await this.getSHA(),
            }),
        });
        return response.ok;
    },

    async getSHA() {
        const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/networks.json`, {
            headers: { Authorization: `token ${this.githubToken}` },
        });
        const data = await response.json();
        return data.sha;
    },

    async register(args) {
        const [username, password, network] = args;
        if (!username || !password || !network) {
            this.os.displayMessage("Usage: register [username] [password] [network]");
            return;
        }

        const data = await this.fetchData();
        if (data.users.find((user) => user.username === username)) {
            this.os.displayMessage("Error: Username already exists.");
            return;
        }

        data.users.push({ username, password, network });
        await this.updateData(data);
        this.os.displayMessage(`User '${username}' registered under '${network}'.`);
    },

    async login(args) {
        const [username, password] = args;
        const data = await this.fetchData();

        const user = data.users.find((user) => user.username === username && user.password === password);
        if (!user) {
            this.os.displayMessage("Error: Invalid credentials.");
            return;
        }

        this.loggedInUser = user;
        this.os.displayMessage(`User '${username}' logged in.`);
    },

    async createPost(args) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            this.os.displayMessage("Usage: createpost [title] [content]");
            return;
        }

        const data = await this.fetchData();
        const network = this.loggedInUser.network;

        if (!data.networks[network]) data.networks[network] = [];
        data.networks[network].push({ title, content: content.join(" "), author: this.loggedInUser.username });

        await this.updateData(data);
        this.os.displayMessage(`Post '${title}' created in network '${network}'.`);
    },

    async viewPosts() {
        const data = await this.fetchData();
        const network = this.loggedInUser.network;
        const posts = data.networks[network] || [];

        if (posts.length === 0) {
            this.os.displayMessage("No posts in your network.");
            return;
        }

        posts.forEach((post) => this.os.displayMessage(`- ${post.title} by ${post.author}`));
    },
};
