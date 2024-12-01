export default {
    async init(os) {
        os.registerCommand("register", (args) => this.register(args, os));
        os.registerCommand("login", (args) => this.login(args, os));
        os.registerCommand("createpost", (args) => this.createPost(args, os));
        os.registerCommand("viewposts", (args) => this.viewPosts(args, os));

        os.displayMessage("LuxNet Application loaded. Available commands: register, login, createpost, viewposts.");
    },

    async register(args, os) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: register [username] [password]");
        }
        // 사용자 등록 로직 (파일 또는 메모리 저장)
        os.displayMessage(`Registered user: ${username}`);
    },

    async login(args, os) {
        const [username, password] = args;
        if (!username || !password) {
            return os.displayMessage("Usage: login [username] [password]");
        }
        // 로그인 로직
        os.displayMessage(`User '${username}' logged in.`);
    },

    async createPost(args, os) {
        const [title, ...content] = args;
        if (!title || !content.length) {
            return os.displayMessage("Usage: createpost [title] [content]");
        }
        // 게시글 작성 로직
        os.displayMessage(`Post created: ${title}`);
    },

    async viewPosts(args, os) {
        // 게시글 보기 로직
        os.displayMessage("Viewing posts...");
    }
};
