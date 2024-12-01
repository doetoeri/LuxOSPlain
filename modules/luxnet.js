export default {
    async init(os) {
        os.registerCommand("register", this.register.bind(this));
        os.registerCommand("login", this.login.bind(this));
        os.registerCommand("createpost", this.createPost.bind(this));
        os.registerCommand("viewposts", this.viewPosts.bind(this));
        os.registerCommand("editpost", this.editPost.bind(this));
        os.registerCommand("deletepost", this.deletePost.bind(this));
        os.displayMessage("LuxNet Module loaded. Available commands: register, login, createpost, viewposts, editpost, deletepost.");

        // 필요한 파일 초기화
        await this.ensureFileExists("users.json", []);
        await this.ensureFileExists("posts.json", []);
    },

    // GitHub에 파일이 없으면 생성
    async ensureFileExists(filename, defaultData) {
        try {
            await this.readFile(filename); // 파일 존재 여부 확인
        } catch (error) {
            if (error.message.includes("404")) {
                // 파일이 없으면 생성
                await this.writeFile(filename, defaultData);
                os.displayMessage(`File '${filename}' created with default data.`);
            } else {
                os.displayMessage(`Error checking file '${filename}': ${error.message}`);
            }
        }
    },

    async readFile(filename) {
        const response = await fetch(`https://api.github.com/repos/doetoeri/LuxNet/contents/${filename}`, {
            headers: { Authorization: `token ${process.env.LUXNET_TOKEN}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
        const data = await response.json();
        return JSON.parse(atob(data.content));
    },

    async writeFile(filename, data) {
        const content = btoa(JSON.stringify(data, null, 2));
        const url = `https://api.github.com/repos/doetoeri/LuxNet/contents/${filename}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: { Authorization: `token ${process.env.LUXNET_TOKEN}` },
            body: JSON.stringify({
                message: `Initialize ${filename}`,
                content,
            }),
        });
        if (!response.ok) throw new Error(`Failed to write ${filename}`);
    },

    // 예제 명령어들
    async register(args) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: register [username] [password]");
        }
        const users = await this.readFile("users.json");
        if (users.some(user => user.username === username)) {
            return os.displayMessage("Username already exists.");
        }
        users.push({ username, password });
        await this.writeFile("users.json", users);
        os.displayMessage("Registration successful.");
    },

    async createPost(args) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            return os.displayMessage("Usage: createpost [title] [content]");
        }
        const posts = await this.readFile("posts.json");
        posts.push({ id: posts.length + 1, title, content: content.join(" "), author: "admin" });
        await this.writeFile("posts.json", posts);
        os.displayMessage("Post created successfully.");
    },

    async viewPosts() {
        const posts = await this.readFile("posts.json");
        if (posts.length === 0) {
            return os.displayMessage("No posts available.");
        }
        posts.forEach(post => os.displayMessage(`[${post.id}] ${post.title} by ${post.author}`));
    },
};
