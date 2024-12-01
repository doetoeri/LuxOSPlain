class LuxOS {
    constructor() {
        this.commands = {}; // 명령어 저장 객체
        this.init();
    }

    async init() {
        // 명령어를 직접 설정
        this.commands['help'] = this.showHelp.bind(this);
        this.commands['ins'] = this.insertApplication.bind(this); // Install application
        this.commands['listapps'] = this.listApplications.bind(this);
        this.commands['exit'] = this.exitSystem.bind(this);

        this.displayMessage("Welcome to LuxOS* Modular");
        this.displayMessage("Type 'help' to see available commands.");
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
            if (this.commands[`app_${appName}`]) {
                this.displayMessage(`Application '${appName}' is already installed.`);
                return;
            }

            const application = await import(`./apps/${appName}.js`);
            this.commands[`app_${appName}`] = application.default.init(this); // 응용프로그램 연결
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
        const installedApps = Object.keys(this.commands).filter(cmd => cmd.startsWith('app_'));
        if (installedApps.length === 0) {
            this.displayMessage("No applications installed.");
        } else {
            this.displayMessage(`Installed applications: ${installedApps.map(cmd => cmd.replace('app_', '')).join(', ')}`);
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
