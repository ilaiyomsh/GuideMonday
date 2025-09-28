Implementation Guide: Rich Text Editor for Content Blocks1. IntroductionThis document provides a comprehensive guide for implementing the custom-built What You See Is What You Get (WYSIWYG) rich text editor. The editor is designed to be a lightweight, dependency-free component for creating and managing formatted text content within the application's block-based architecture.The primary goal is to provide users with intuitive text formatting capabilities and to ensure that the resulting content is stored efficiently and rendered safely. This guide covers three core aspects:Component Architecture: The structure and functionality of the editor itself.Data Serialization: The process of converting the formatted content into a storable JSON format.Content Rendering: The method for safely displaying the stored content in a read-only view.2. Component Architecture & FunctionalityThe editor is built using standard web technologies (HTML, CSS, JavaScript) without external libraries, ensuring maximum performance and control.2.1. HTML StructureThe component consists of two main parts:Toolbar (<div class="toolbar">): A container for all formatting controls (buttons, dropdowns). Each control is a standard HTML element (<button>, <select>).Editable Area (<div id="editor" contenteditable="true">): This is the core of the editor. The contenteditable attribute transforms the div into a rich text input field where users can type and apply formatting directly.2.2. Core JavaScript Logic: document.execCommand()The primary mechanism for applying text formatting is the document.execCommand() method. This browser-native API applies predefined commands to the currently selected text within an editable region.Command Categories:Simple Commands: Actions that don't require a value (e.g., bold, italic, lists).Example: document.execCommand('bold', false, null);Commands with Values: Actions that require a third argument (e.g., font size, font name, color).Example: document.execCommand('fontName', false, 'Roboto');2.3. Toolbar Controls ImplementationBasic Formatting (Bold, Italic, etc.): Standard buttons that trigger their respective execCommand on click.Dropdowns (Font, Size): <select> elements that trigger execCommand with the selected value on a change event.Color Palette (Custom Implementation):A button toggles the visibility of a custom-built color palette div.Crucial Logic: To prevent the editor from losing focus (and thus the text selection) when the palette is clicked, we must save and restore the selection.saveSelection(): Before showing the palette, the current selection range is captured using window.getSelection().getRangeAt(0) and stored in a variable (savedRange).restoreSelection(): When a color is chosen, the saved range is restored using window.getSelection().addRange(savedRange).Immediately after restoring, the foreColor command is executed with the chosen color value.3. Data Flow: Serialization and StorageThe application architecture requires content blocks to be stored in a JSON format. The text block should conform to a structure like this:{
  "id": "block-1664321789",
  "type": "text",
  "content": "<p>This is <b>formatted</b> text.</p>"
}
3.1. Capturing ContentTo serialize the editor's state, we read the innerHTML property of the contenteditable div. This property returns a single HTML string that contains all the text, structure, and inline styling applied by the user.const editor = document.getElementById('editor');
const htmlContent = editor.innerHTML;
3.2. Creating the JSON ObjectThe captured htmlContent string is then placed into the content field of our block object. The final object is then converted into a JSON string using JSON.stringify() before being sent to the backend for storage.function saveContent() {
    const htmlContent = document.getElementById('editor').innerHTML;

    const contentBlock = {
        id: `block-${new Date().getTime()}`,
        type: 'text',
        content: htmlContent 
    };
    
    // Stringify the object to prepare it for an API call or database insertion
    const jsonString = JSON.stringify(contentBlock);
    
    // Example: sendToServer(jsonString);
    console.log(jsonString);
}
This approach is highly efficient as it delegates the complexity of the content's structure to the browser's HTML engine, avoiding the need for a complex custom data structure.4. Content RenderingTo display the saved content in a non-editable "view" mode, the process is reversed.Fetch and Parse: Retrieve the content block data from the database and parse the JSON string back into a JavaScript object using JSON.parse().Extract HTML: Access the content property from the parsed object, which holds the HTML string.Render in a Container: Inject this HTML string into the innerHTML of a standard, non-editable div in the UI.function renderTextBlock(contentBlock) {
    // Assuming contentBlock is the parsed object: { id: '...', type: 'text', content: '...' }
    const displayElement = document.getElementById(`block-display-${contentBlock.id}`);
    
    // Directly render the stored HTML
    displayElement.innerHTML = contentBlock.content;
}
5. Critical Security Consideration: HTML SanitizationStoring and rendering user-generated HTML introduces a significant security risk: Cross-Site Scripting (XSS). A malicious user could inject <script> tags or other harmful attributes into the editor.It is imperative to sanitize the HTML content before it is rendered.A robust, industry-standard library like DOMPurify should be used. Sanitization should occur right before rendering the content to the page.Example using DOMPurify:// Include DOMPurify library in your project

function renderTextBlock(contentBlock) {
    const displayElement = document.getElementById(`block-display-${contentBlock.id}`);
    
    // Sanitize the HTML string before rendering it
    const cleanHTML = DOMPurify.sanitize(contentBlock.content);
    
    displayElement.innerHTML = cleanHTML;
}
This step is not optional; it is a mandatory security measure to protect the application and its users.