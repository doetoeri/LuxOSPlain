class LuxOS {
    constructor() {
        this.commands = {}; // 명령어 저장
        this.modules = {}; // 로드된 모듈 저장
        this.sharedState = {}; // LuxOS와 모듈 간 공유 데이터
        this.os = this; // LuxOS 인스턴스를 os로 참조
        this.init();
    }

    async init() {
        // 기본 명령어 등록
        this.commands["help"] = this.showHelp.bind(this);
        this.commands["ins"] = this.loadModule.bind(this);
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
