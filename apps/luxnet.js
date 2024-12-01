export default {
    // 초기화: LuxOS와 연결
    async init(os) {
        this.os = os; // LuxOS 컨텍스트 저장
        os.commands["register"] = (args) => this.register(args);
        os.commands["createpost"] = (args) => this.createPost(args);
        os.commands["viewposts"] = (args) => this.viewPosts(args);
        os.commands["settoken"] = (args) => this.setToken(args);

        os.displayMessage("LuxNet Application loaded. Available commands: register, createpost, viewposts, settoken.");
    },

    githubRepo: "doetoeri/LuxOSPlain", // 본인의 GitHub 저장소 이름
    githubToken: process.env.LUXNET_TOKEN || "", // GitHub 토큰 환경 변수

    // GitHub 토큰 설정
    async setToken(args) {
        const [token] = args;
        if (!token) {
            this.os.displayMessage("Usage: settoken [GitHub Personal Access Token]");
            return;
        }
        this.githubToken = token;
        this.os.displayMessage("GitHub token set successfully.");
    },

    // GitHub에서 파일 읽기
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
            this.os.displayMessage(`Error reading file: ${error.message}`);
            return [];
        }
    },

    // GitHub에 파일 쓰기
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
            this.os.displayMessage(`File ${filename} updated successfully.`);
        } catch (error) {
            console.error(`Error writing file: ${error.message}`);
            this.os.displayMessage(`Error writing file: ${error.message}`);
        }
    },

    // 사용자 등록
    async register(args) {
        const [username, password] = args;
        if (!username || !password) {
            this.os.displayMessage("Usage: register [username] [password]");
            return;
        }

        const users = (await this.readFile("users.json")) || [];
        if (users.some(user => user.username === username)) {
            this.os.displayMessage("Error: Username already exists.");
            return;
        }
        users.push({ username, password });
        await this.writeFile("users.json", users);
        this.os.displayMessage(`Registered user: ${username}`);
    },

    // 게시글 작성
    async createPost(args) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            this.os.displayMessage("Usage: createpost [title] [content]");
            return;
        }

        const posts = (await this.readFile("posts.json")) || [];
        posts.push({ id: posts.length + 1, title, content: content.join(" "), author: "admin" });
        await this.writeFile("posts.json", posts);
        this.os.displayMessage(`Post created: ${title}`);
    },

    // 게시글 보기
    async viewPosts() {
        const posts = (await this.readFile("posts.json")) || [];
        if (posts.length === 0) {
            this.os.displayMessage("No posts available.");
            return;
        }
        posts.forEach(post => this.os.displayMessage(`[${post.id}] ${post.title} by ${post.author}`));
    }
};
