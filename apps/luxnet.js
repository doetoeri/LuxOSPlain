export default {
    async init(os) {
        this.os = os; // LuxOS와 연결

        // 명령어 등록
        os.commands["register"] = (args) => this.register(args);
        os.commands["login"] = (args) => this.login(args);
        os.commands["createpost"] = (args) => this.createPost(args);
        os.commands["viewposts"] = (args) => this.viewPosts(args);

        os.displayMessage("LuxNet Application loaded. Available commands: register, login, createpost, viewposts.");
    },

    // 사용자 등록
    async register(args) {
        const [username, password] = args;
        if (!username || !password) {
            this.os.displayMessage("Usage: register [username] [password]");
            return;
        }

        if (!this.os.sharedState.users) {
            this.os.sharedState.users = [];
        }

        const users = this.os.sharedState.users;
        if (users.some(user => user.username === username)) {
            this.os.displayMessage("Error: Username already exists.");
            return;
        }
        users.push({ username, password });
        this.os.displayMessage(`Registered user: ${username}`);
    },

    // 로그인
    async login(args) {
        const [username, password] = args;
        if (!username || !password) {
            this.os.displayMessage("Usage: login [username] [password]");
            return;
        }

        const users = this.os.sharedState.users || [];
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            this.os.sharedState.loggedInUser = user.username;
            this.os.displayMessage(`User '${username}' logged in successfully.`);
        } else {
            this.os.displayMessage("Error: Invalid username or password.");
        }
    },

    // 게시글 작성
    async createPost(args) {
        const loggedInUser = this.os.sharedState.loggedInUser;
        if (!loggedInUser) {
            this.os.displayMessage("Error: You must be logged in to create a post.");
            return;
        }

        const [title, ...content] = args;
        if (!title || !content.length) {
            this.os.displayMessage("Usage: createpost [title] [content]");
            return;
        }

        if (!this.os.sharedState.posts) {
            this.os.sharedState.posts = [];
        }

        const posts = this.os.sharedState.posts;
        posts.push({ id: posts.length + 1, title, content: content.join(" "), author: loggedInUser });
        this.os.displayMessage(`Post created: ${title}`);
    },

    // 게시글 보기
    async viewPosts() {
        const posts = this.os.sharedState.posts || [];
        if (posts.length === 0) {
            this.os.displayMessage("No posts available.");
            return;
        }
        posts.forEach(post => this.os.displayMessage(`[${post.id}] ${post.title} by ${post.author}`));
    }
};
