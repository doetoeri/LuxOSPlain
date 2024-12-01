export default {
    init(os) {
        os.registerCommand('luxwrite', this.luxWrite.bind(this, os));
        os.registerCommand('luxcalc', this.luxCalc.bind(this, os));
        os.registerCommand('luxfile', this.luxFile.bind(this, os));
        os.registerCommand('luxmail', this.luxMail.bind(this, os));
        os.displayMessage("LuxOffice Suite loaded. Available commands: luxwrite, luxcalc, luxfile, luxmail");
    },

    // LuxWrite: 텍스트 편집기
    luxWrite(os) {
        os.displayMessage("Opening LuxWrite (Text Editor)...");
        os.displayMessage("Type your text below and type ':save [filename]' to save or ':exit' to quit.");
        os.displayMessage("Start typing:");

        const inputField = document.getElementById('input');
        let tempContent = "";
        inputField.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = inputField.value.trim();
                if (command.startsWith(':save')) {
                    const filename = command.split(' ')[1];
                    os.files[filename] = tempContent;
                    os.displayMessage(`File '${filename}' saved.`);
                    tempContent = "";
                    inputField.onkeypress = null;
                } else if (command === ':exit') {
                    os.displayMessage("Exiting LuxWrite.");
                    tempContent = "";
                    inputField.onkeypress = null;
                } else {
                    tempContent += `${command}\n`;
                }
                inputField.value = '';
            }
        };
    },

    // LuxCalc: 계산기
    luxCalc(os) {
        os.displayMessage("Opening LuxCalc (Calculator)...");
        os.displayMessage("Type a mathematical expression (e.g., 5+3) and press Enter. Type ':exit' to quit.");

        const inputField = document.getElementById('input');
        inputField.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const expression = inputField.value.trim();
                if (expression === ':exit') {
                    os.displayMessage("Exiting LuxCalc.");
                    inputField.onkeypress = null;
                } else {
                    try {
                        const result = eval(expression);
                        os.displayMessage(`Result: ${result}`);
                    } catch {
                        os.displayMessage("Invalid expression. Please try again.");
                    }
                }
                inputField.value = '';
            }
        };
    },

    // LuxFile: 파일 관리
    luxFile(os) {
        os.displayMessage("Opening LuxFile (File Manager)...");
        os.displayMessage("Available commands: create [filename], read [filename], delete [filename], exit");

        const inputField = document.getElementById('input');
        inputField.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = inputField.value.trim();
                const [action, filename] = command.split(' ');
                if (command === 'exit') {
                    os.displayMessage("Exiting LuxFile.");
                    inputField.onkeypress = null;
                } else if (action === 'create') {
                    if (os.files[filename]) {
                        os.displayMessage(`File '${filename}' already exists.`);
                    } else {
                        os.files[filename] = "";
                        os.displayMessage(`File '${filename}' created.`);
                    }
                } else if (action === 'read') {
                    if (os.files[filename]) {
                        os.displayMessage(`Contents of '${filename}': ${os.files[filename]}`);
                    } else {
                        os.displayMessage(`File '${filename}' not found.`);
                    }
                } else if (action === 'delete') {
                    if (os.files[filename]) {
                        delete os.files[filename];
                        os.displayMessage(`File '${filename}' deleted.`);
                    } else {
                        os.displayMessage(`File '${filename}' not found.`);
                    }
                } else {
                    os.displayMessage("Invalid command. Use: create [filename], read [filename], delete [filename], exit");
                }
                inputField.value = '';
            }
        };
    },

    // LuxMail: 이메일 시뮬레이션
    luxMail(os) {
        os.displayMessage("Opening LuxMail (Email System)...");
        os.displayMessage("Type your email content and ':send' to send or ':exit' to quit.");
        os.displayMessage("Start typing:");

        const inputField = document.getElementById('input');
        let tempContent = "";
        inputField.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = inputField.value.trim();
                if (command === ':send') {
                    os.displayMessage(`Email sent: ${tempContent}`);
                    tempContent = "";
                    inputField.onkeypress = null;
                } else if (command === ':exit') {
                    os.displayMessage("Exiting LuxMail.");
                    tempContent = "";
                    inputField.onkeypress = null;
                } else {
                    tempContent += `${command}\n`;
                }
                inputField.value = '';
            }
        };
    }
};
