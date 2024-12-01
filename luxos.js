class LuxOS {
    constructor() {
        this.commands = {}; // 명령어 저장
        this.modules = {}; // 로드된 모듈 저장
        this.init();
    }

    async init() {
        this.registerCommand('help', this.showHelp.bind(this));
        this.registerCommand('loadmodule', this.loadModule.bind(this));
        this.registerCommand('listmodules', this.listModules.bind(this));
        this.registerCommand('exit', this.exitSystem.bind(this));

        this.displayMessage("Welcome to LuxOS* Modular");
        this.displayMessage("Type 'help' to see available commands.");
    }

    // 명령어 등록
    registerCommand(name, callback) {
        this.commands[name] = callback;
    }

    // 메시지 출력
    displayMessage(message) {
        const terminal = document.getElementById('terminal');
        terminal.textContent += `\n${message}`;
        terminal.scrollTop = terminal.scrollHeight;
    }

    // 명령어 실행
    async executeCommand(command) {
        const [cmd, ...args] = command.trim().split(' ');
        if (this.commands[cmd]) {
            try {
                const result = await this.commands[cmd](args);
                if (result) {
                    this.displayMessage(result);
                }
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
        this.displayMessage("- help: Show this help message.");
        this.displayMessage("- loadmodule [module]: Load a module.");
        this.displayMessage("- listmodules: List all loaded modules.");
        this.displayMessage("- exit: Exit the system.");
    }

    // 명령어: loadmodule
    async loadModule(args) {
        const moduleName = args[0];
        if (!moduleName) {
            this.displayMessage("Usage: loadmodule [module_name]");
            return;
        }

        try {
            if (this.modules[moduleName]) {
                this.displayMessage(`Module '${moduleName}' is already loaded.`);
                return;
            }

            // 모듈 파일을 동적으로 가져와 실행
            const module = await this.loadModuleFiles(moduleName);
            this.modules[moduleName] = module;

            this.displayMessage(`Module '${moduleName}' loaded successfully.`);
            if (module.default && typeof module.default.init === "function") {
                await module.default.init(this); // LuxOS 컨텍스트 전달
            }
        } catch (error) {
            this.displayMessage(`Failed to load module '${moduleName}': ${error.message}`);
        }
    }

    // 모듈 파일 로드
    async loadModuleFiles(moduleName) {
        const basePath = `./modules/${moduleName}`;
        const mainModule = await import(`${basePath}.js`);
        const additionalFiles = await this.fetchRelatedFiles(moduleName);

        // 관련 파일을 LuxOS에 추가 처리 (필요시 초기화)
        for (const file of additionalFiles) {
            this.displayMessage(`Processing additional file: ${file}`);
            // 필요에 따라 추가 로직 구현
        }

        return mainModule;
    }

    // 관련 파일 검색 (예: .json, .config 등)
    async fetchRelatedFiles(moduleName) {
        const response = await fetch(`./modules/${moduleName}/related.json`);
        if (response.ok) {
            return await response.json(); // 관련 파일 목록
        }
        return []; // 관련 파일이 없으면 빈 배열 반환
    }

    // 명령어: listmodules
    listModules() {
        const loadedModules = Object.keys(this.modules);
        if (loadedModules.length === 0) {
            this.displayMessage("No modules loaded.");
        } else {
            this.displayMessage(`Loaded modules: ${loadedModules.join(', ')}`);
        }
    }

    // 명령어: exit
    exitSystem() {
        this.displayMessage("Exiting LuxOS*. Goodbye!");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const luxOS = new LuxOS();
    const inputField = document.getElementById('input');
    const terminal = document.getElementById('terminal');

    inputField.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = inputField.value.trim();
            terminal.textContent += `\n> ${command}`;
            await luxOS.executeCommand(command);
            inputField.value = '';
        }
    });
});
