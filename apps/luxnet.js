export default {
    async init(os) {
        os.commands["register"] = (args) => this.register(args, os);
        os.commands["createpost"] = (args) => this.createPost(args, os);
        os.commands["viewposts"] = (args) => this.viewPosts(args, os);
        os.commands["settoken"] = (args) => this.setToken(args, os);

        os.displayMessage("LuxNet Application loaded. Available commands: register, createpost, viewposts, settoken.");
    },

    githubRepo: "doetoeri/LuxOSPlain", // 본인의 GitHub 저장소
    githubToken: "", // 초기화

    async setToken(args, os) {
        const [token] = args;
        if (!token) {
            os.displayMessage("Usage: settoken [GitHub Personal Access Token]");
            return;
        }
        this.githubToken = token;
        os.displayMessage("GitHub token set successfully.");
    },

    async readFile(filename) {
        try {
            if (!this.githubToken) throw new Error("GitHub token is not set. Use 'settoken' to set it.");
            const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/data/${filename}`, {
                headers: {
                    Authorization: `token ${this.githubToken}`
                }
            });
            if (!response.ok) throw new Error(`Failed to read ${filename}`);
            const data = await response.json();
            return JSON.parse(atob(data.content)); // Base64 디코딩 후 JSON 파싱
        } catch (error) {
            console.error(`Error reading file: ${error.message}`);
            return [];
        }
    },

    async writeFile(filename, data) {
        try {
            if (!this.githubToken) throw new Error("GitHub token is not set. Use 'settoken' to set it.");
            // 파일 SHA 가져오기
            const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/data/${filename}`, {
                headers: {
                    Authorization: `token ${this.githubToken}`
                }
            });
            if (!response.ok) throw new Error(`Failed to fetch SHA for ${filename}`);
            const fileInfo = await response.json();

            // 파일 업데이트
            const updateResponse = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/data/${filename}`, {
                method: "PUT",
                headers: {
                    Authorization: `token ${this.githubToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `Update ${filename}`,
                    content: btoa(JSON.stringify(data, null, 2)), // Base64 인코딩
                    sha: fileInfo.sha
                })
            });

            if (!updateResponse.ok) throw new Error(`Failed to update ${filename}`);
        } catch (error) {
            console.error(`Error writing file: ${error.message}`);
        }
    },

    async register(args, os) {
        const [username, password] = args;
        if (!username || !password) {
            os.displayMessage("Usage: register [username] [password]");
            return;
        }
        const users = (await this.readFile("users.json")) || [];
        if (users.some(user => user.username === username)) {
            os.displayMessage("Error: Username already exists.");
            return;
        }
        users.push({ username, password });
        await this.writeFile("users.json", users);
        os.displayMessage(`Registered user: ${username}`);
    },

    async createPost(args, os) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            os.displayMessage("Usage: createpost [title] [content]");
            return;
        }
        const posts = (await this.readFile("posts.json")) || [];
        posts.push({ id: posts.length + 1, title, content: content.join(" "), author: "admin" });
        await this.writeFile("posts.json", posts);
        os.displayMessage(`Post created: ${title}`);
    },

    async viewPosts(args, os) {
        const posts = (await this.readFile("posts.json")) || [];
        if (posts.length === 0) {
            os.displayMessage("No posts available.");
            return;
        }
        posts.forEach(post => os.displayMessage(`[${post.id}] ${post.title} by ${post.author}`));
    }
};
