export default {
    async init(os) {
        os.commands["register"] = (args) => this.register(args, os);
        os.commands["createpost"] = (args) => this.createPost(args, os);
        os.commands["viewposts"] = (args) => this.viewPosts(args, os);

        os.displayMessage("LuxNet Application loaded. Available commands: register, createpost, viewposts.");
    },

    // GitHub 저장소 정보
    githubRepo: "doetoeri/LuxOSPlain", // 본인의 GitHub 저장소

    async getToken() {
        // GitHub Actions 또는 Codespaces 환경 변수를 사용하여 토큰을 가져옵니다.
        return process.env.LUXNET_TOKEN;
    },

    async readFile(filename) {
        try {
            const token = await this.getToken();
            const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/data/${filename}`, {
                headers: {
                    Authorization: `token ${token}`
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
            const token = await this.getToken();
            // 파일 SHA 가져오기
            const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/data/${filename}`, {
                headers: {
                    Authorization: `token ${token}`
                }
            });
            if (!response.ok) throw new Error(`Failed to fetch SHA for ${filename}`);
            const fileInfo = await response.json();

            // 파일 업데이트
            const updateResponse = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/data/${filename}`, {
                method: "PUT",
                headers: {
                    Authorization: `token ${token}`,
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
