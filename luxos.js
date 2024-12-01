class LuxOS {
    constructor() {
        this.commands = {}; // 명령어 저장
        this.modules = {}; // 로드된 모듈 저장
        this.apps = {}; // 로드된 응용프로그램 저장
        this.sharedState = {}; // 공유 데이터 저장
        this.os = this; // LuxOS 인스턴스를 os로 참조
        this.githubRepo = "doetoeri/LuxOSPlain"; // GitHub 저장소 경로
        this.githubToken = ""; // GitHub 토큰 (환경 변수로 관리 권장)
        this.init();
    }

    async init() {
        // 기본 명령어 등록
        this.commands["help"] = this.showHelp.bind(this);
        this.commands["ins"] = this.loadModule.bind(this);
        this.commands["addapp"] = this.addApp.bind(this);
        this.commands["listapps"] = this.listApps.bind(this);
        this.commands["runapp"] = this.runApp.bind(this);

        this.displayMessage("Welcome to LuxOS* Modular");
        this.displayMessage("Type 'help' to see available commands.");
    }

    // 메시지 출력
    displayMessage(message) {
        const terminal = document.getElementById("terminal");
        terminal.textContent += `\n${message}`;
        terminal.scrollTop = terminal.scrollHeight;
    }

    // 명령어 실행
    async executeCommand(command) {
        const [cmd, ...args] = command.trim().split(" ");
        if (this.commands[cmd]) {
            try {
                await this.commands[cmd](args);
            } catch (error) {
                this.displayMessage(`Error executing '${cmd}': ${error.message}`);
            }
        } else {
            this.displayMessage(`Unknown command: ${cmd}`);
        }
    }

    // 명령어: help
    showHelp() {
        this.displayMessage("Available commands:");
        for (const cmd in this.commands) {
            this.displayMessage(`- ${cmd}`);
        }
    }

    // 명령어: ins (Install Module)
    async loadModule(args) {
        const moduleName = args[0];
        if (!moduleName) {
            this.displayMessage("Usage: ins [module_name]");
            return;
        }

        try {
            if (this.modules[moduleName]) {
                this.displayMessage(`Module '${moduleName}' is already loaded.`);
                return;
            }

            const module = await import(`./modules/${moduleName}.js`);
            this.modules[moduleName] = module.default;
            await module.default.init(this.os); // LuxOS 컨텍스트 전달
            this.displayMessage(`Module '${moduleName}' loaded successfully.`);
        } catch (error) {
            this.displayMessage(`Failed to load module '${moduleName}': ${error.message}`);
        }
    }

    // 명령어: addapp (Add Application)
    async addApp(args) {
        const appName = args[0];
        if (!appName) {
            this.displayMessage("Usage: addapp [app_name]");
            return;
        }

        try {
            if (this.apps[appName]) {
                this.displayMessage(`Application '${appName}' is already added.`);
                return;
            }

            const app = await import(`./apps/${appName}.js`);
            this.apps[appName] = app.default;
            this.displayMessage(`Application '${appName}' added successfully.`);
        } catch (error) {
            this.displayMessage(`Failed to add application '${appName}': ${error.message}`);
        }
    }

    // 명령어: listapps (List Applications)
    listApps() {
        const appNames = Object.keys(this.apps);
        if (appNames.length === 0) {
            this.displayMessage("No applications added.");
        } else {
            this.displayMessage(`Available applications: ${appNames.join(", ")}`);
        }
    }

    // 명령어: runapp (Run Application)
    async runApp(args) {
        const appName = args[0];
        if (!appName) {
            this.displayMessage("Usage: runapp [app_name]");
            return;
        }

        const app = this.apps[appName];
        if (!app) {
            this.displayMessage(`Application '${appName}' is not added.`);
            return;
        }

        try {
            await app.run(this.os); // 앱 실행 (LuxOS 컨텍스트 전달)
        } catch (error) {
            this.displayMessage(`Failed to run application '${appName}': ${error.message}`);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const luxOS = new LuxOS();
    const inputField = document.getElementById("input");

    inputField.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            const command = inputField.value.trim();
            luxOS.executeCommand(command);
            inputField.value = "";
        }
    });
});
