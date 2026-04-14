import * as vscode from 'vscode';
import { detectPrivateKey, PRIVATE_KEY_PATTERNS } from './detector';
import { playAlert } from './audio';

// Create a diagnostics collection — think of this as 
// a managed list of errors VS Code tracks for you
const diagnosticCollection = vscode.languages.createDiagnosticCollection('plaintext-police');

let lastAlertTime = 0;

export function activate(context: vscode.ExtensionContext) {
	console.log('Plaintext Police activated!');

	// Scan all files in workspace on startup
	async function scanWorkspace() {
		const files = await vscode.workspace.findFiles(
			// ONLY these specific files
			'**/{.env,.env.*,*.sol,Makefile,makefile,*.sh}',

			// EXCLUDE all of these
			'{**/node_modules/**,**/broadcast/**,**/cache/**,**/out/**,**/lib/**,**/dist/**,**/build/**,**/.git/**,**/generated/**,**/prisma/**}'
		);

		for (const file of files) {
			const document = await vscode.workspace.openTextDocument(file);
			scanDocument(document, context);
		}
	}

	scanWorkspace();

	const listener = vscode.workspace.onDidChangeTextDocument(event => {
		scanDocument(event.document, context);
	});

	const openListener = vscode.workspace.onDidOpenTextDocument(document => {
		scanDocument(document, context);
	});

	// Scan all files already open when VS Code loads
	vscode.workspace.textDocuments.forEach(document => {
		scanDocument(document, context);
	});

	const statusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	);

	statusBar.text = '🚔 Plaintext Police: Active';
	statusBar.tooltip = 'Plaintext Police is watching for exposed private keys';
	statusBar.show();

	context.subscriptions.push(statusBar);
	context.subscriptions.push(listener);
	context.subscriptions.push(openListener);
	context.subscriptions.push(diagnosticCollection);
}

function scanDocument(document: vscode.TextDocument, context: vscode.ExtensionContext) {
	const diagnostics: vscode.Diagnostic[] = [];

	// Loop through every line in the file
	for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
		const line = document.lineAt(lineIndex);

		// Check this specific line against your patterns
		const isExposed = PRIVATE_KEY_PATTERNS.some(pattern =>
			pattern.test(line.text)
		);

		if (isExposed) {
			// Mark the entire line as an error
			const range = new vscode.Range(
				lineIndex, 0,           // start: line N, character 0
				lineIndex, line.text.length  // end: line N, last character
			);

			const diagnostic = new vscode.Diagnostic(
				range,
				"🚨 Private key exposed in plain text — Plaintext Police",
				vscode.DiagnosticSeverity.Error
			);

			diagnostics.push(diagnostic);

			// Trigger the popup (with debounce)
			const now = Date.now();
			if (now - lastAlertTime >= 5000) {
				lastAlertTime = now;
				const config = vscode.workspace.getConfiguration('plaintextPolice');
				if (config.get('enableSound')) {
					playAlert(context);
				}
				vscode.window.showErrorMessage(
					"🚨 Don't put your private key in plain text!",
					"I understand"
				).then(selection => {
					if (selection === "I understand") {
						vscode.window.showWarningMessage(
							"Make sure .env is in your .gitignore and consider using an encrypted keystore instead."
						);
					}
				});
			}
		}
	}

	// Apply diagnostics to this file — red squiggles appear
	diagnosticCollection.set(document.uri, diagnostics);
}

export function deactivate() { }