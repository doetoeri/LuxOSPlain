class LuxOS {
    constructor() {
        this.commands = {}; // 명령어 저장
        this.applications = {}; // 설치된 응용프로그램 저장
        this.init();
    }

    async init() {
        this.registerCommand('help', this.showHelp.bind(this));
        this.registerCommand('ins', this.insertApplication.bind(this)); // install application
        this.registerCommand('listapps', this.listApplications.bind(this));
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
                } else {
                    this.displayMessage(`Command '${cmd}' executed successfully.`);
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
        this.displayMessage("- ins [application]: Install an application.");
        this.displayMessage("- listapps: List all installed applications.");
        this.displayMessage("- exit: Exit the system.");
    }

    // 명령어: ins (Install Application)
    async insertApplication(args) {
        const appName = args[0];
        if (!appName) {
            this.displayMessage("Usage: ins [application_name]");
            return;
        }

        try {
            if (this.applications[appName]) {
                this.displayMessage(`Application '${appName}' is already installed.`);
                return;
            }

            const application = await import(`./apps/${appName}.js`);
            this.applications[appName] = application;
            this.displayMessage(`Application '${appName}' installed successfully.`);
            if (application.default && typeof application.default.init === "function") {
                await application.default.init(this); // LuxOS 컨텍스트 전달
            } else {
                this.displayMessage(`Application '${appName}' does not have a valid init function.`);
            }
        } catch (error) {
            this.displayMessage(`Failed to install application '${appName}': ${error.message}`);
        }
    }

    // 명령어: listapps
    listApplications() {
        const installedApps = Object.keys(this.applications);
        if (installedApps.length === 0) {
            this.displayMessage("No applications installed.");
        } else {
            this.displayMessage(`Installed applications: ${installedApps.join(', ')}`);
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
