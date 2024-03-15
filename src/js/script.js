class TandemCorrect {
    #m_MaxStepIndex;
    #m_CurrentStepIndex;

    #m_originalTextEl;
    #m_correctedTextEl;
    #m_PreviewEl;
    #m_PreviewLoadingEl;
    #m_SaveContainerEl;
    #m_SaveLinkEl;
    #m_SaveLoadingEl;
    #m_NoteButtonEl;
    #m_Highlighter;
    #m_RangeCache;
    #m_Notes;

    constructor() {
        this.#m_CurrentStepIndex = 0;
    }

    init() {
        rangy.init();

        this.#m_originalTextEl = document.getElementById('originalText');
        this.#m_correctedTextEl = document.getElementById('correctedText');
        this.#m_PreviewEl = document.getElementById('changes');
        this.#m_PreviewLoadingEl = document.getElementById('preview_loading');
        this.#m_SaveContainerEl = document.getElementById('save_link');
        this.#m_SaveLinkEl = this.#m_SaveContainerEl.querySelector('input[type="url"]');
        this.#m_SaveLoadingEl = document.getElementById('save_loading');
        this.#m_NoteButtonEl = document.querySelector('article[data-step="4"] button[data-purpose="Add_Note"]');
        this.#m_Highlighter = rangy.createHighlighter();
        this.#m_RangeCache = null;
        this.#m_Notes = [];

        this.#m_MaxStepIndex = document.querySelectorAll('.card').length - 1;

        this.#m_Highlighter.addClassApplier(rangy.createClassApplier('note', {
            ignoreWhiteSpace: true,
            elementTagName: 'span',
            elementProperties: {
                onclick: (event) => {
                    this.editSelectionNote(event.target);
                }
            }
        }));

        this.setupEventListeners();
    }

    setupEventListeners() {
        const wizardElement = document.getElementById('Wizard');
        wizardElement.addEventListener('click', (event) => {
            const purpose = event.target.getAttribute('data-purpose');
            if (purpose) {
                this.handleNavigation(purpose);
            }
        });

        document.addEventListener('keydown', (event) => { this.onKeyDown(event); });
        document.addEventListener('selectionchange', (event) => { this.onSelectionChange(event); });
        this.#m_SaveLinkEl.addEventListener('focus', (event) => { this.onSaveLinkFocus(event); })
    }

    onKeyDown(event) {
        if (event.key != 'Escape')
            return;

        this.closeModals();
    }

    onSelectionChange(event) {
        if (this.#m_CurrentStepIndex != 3)
            return;

        this.#m_NoteButtonEl.disabled = true;

        const selection = rangy.getSelection();

        if (selection.rangeCount <= 0 || selection.isCollapsed)
            return;

        const isWithinDiv = this.#m_PreviewEl.contains(selection.getRangeAt(0).commonAncestorContainer);

        if (isWithinDiv && !this.#m_Highlighter.selectionOverlapsHighlight(selection)) {
            this.#m_NoteButtonEl.disabled = false;

            // As soon as the Add Note button is clicked, the selected range is gone.
            // We save it here to restore just before a highlight is added.
            this.#m_RangeCache = selection.saveRanges();
        }
    }

    onSaveLinkFocus(event) {
        event.target.select();
    }

    async handleNavigation(purpose) {
        if (purpose === 'Navigate_Next' && this.#m_CurrentStepIndex < this.#m_MaxStepIndex) {
            const canContinue = await this.validateStepNext();
            if (!canContinue)
                return;

            this.#m_CurrentStepIndex++;
        } else if (purpose === 'Navigate_Previous' && this.#m_CurrentStepIndex > 0) {
            const canContinue = await this.validateStepPrevious();
            if (!canContinue)
                return;

            this.#m_CurrentStepIndex--;
        } else if (purpose === "Add_Note") {
            this.addSelectionNote();
            return;
        }

        this.updateStepVisibility();
        this.postUpdateStepVisibility();
    }

    async validateStepNext() {
        switch (this.#m_CurrentStepIndex) {
            case 1:
                if (this.isNullOrWhitespace(this.#m_originalTextEl.value)) {
                    this.showModal(JS_LOCALIZE['TEXT_MISSING_TITLE'], JS_LOCALIZE['TEXT_MISSING_CONTENT']);
                    return false;
                }

                if (this.isNullOrWhitespace(this.#m_correctedTextEl.value))
                    this.#m_correctedTextEl.value = this.#m_originalTextEl.value;

                return true;
            case 2:
                if (this.#m_correctedTextEl.value === this.#m_originalTextEl.value) {
                    this.showModal(JS_LOCALIZE['CORRECTION_IS_SAME_TITLE'], JS_LOCALIZE['CORRECTION_IS_SAME_TEXT']);
                    return false;
                }

                return true;
            case 4:
                let valid = await this.validateCaptcha();

                if (!valid) {
                    this.showModal(JS_LOCALIZE['CAPTCHA_FAILED_TITLE'], JS_LOCALIZE['CAPTCHA_FAILED_TEXT']);
                    return false;
                }

                return true;
            default:
                return true;
        }
    }

    async validateStepPrevious() {
        switch (this.#m_CurrentStepIndex) {
            case 3:
                if (this.#m_Notes.length === 0)
                    return true;
                let result = await this.showPrompt(JS_LOCALIZE['NOTES_DELETED_ON_BACK_TITLE'], JS_LOCALIZE['NOTES_DELETED_ON_BACK_TEXT']);

                if (result) {
                    this.#m_Highlighter.removeAllHighlights();
                    this.#m_Notes = [];
                }

                return result;
            default:
                return true;
        }
    }

    updateStepVisibility() {
        document.querySelectorAll('.card').forEach((card, index) => {
            if (index === this.#m_CurrentStepIndex) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
    }

    async postUpdateStepVisibility() {
        switch (this.#m_CurrentStepIndex) {
            case 1:
                this.#m_originalTextEl.focus();
                return;
            case 2:
                this.#m_correctedTextEl.focus();
                return;
            case 3:
                this.generatePreview();
                return;
            case 4:
                return;
            case 5:
                this.generateLink();
                return;
        }
    }

    async generatePreview() {
        const step4 = document.querySelector('article[data-step="4"]');
        const noteButton = step4.querySelector('button[data-purpose="Add_Note"]');
        const nextButton = step4.querySelector('button[data-purpose="Navigate_Next"]');

        noteButton.disabled = true;
        nextButton.disabled = true;

        this.#m_PreviewEl.classList.add('hide');
        this.#m_PreviewLoadingEl.classList.remove('hide');

        const data = { original: this.#m_originalTextEl.value, corrected: this.#m_correctedTextEl.value };
        const url = 'preview.php';

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Session': SESSION_ID },
            body: new URLSearchParams(data).toString(),
        })
            .then(response => {
                if (!response.ok) {
                    console.debug(response);
                    throw new Error(this.statusToFriendlyText(response));
                }
                return response.text();
            })
            .then(data => {
                this.#m_PreviewEl.innerHTML = data;
                this.#m_PreviewEl.classList.remove('hide');
                this.#m_PreviewLoadingEl.classList.add('hide');
                nextButton.disabled = false;
            })
            .catch(error => {
                this.showModal(JS_LOCALIZE['PREVIEW_ERROR_TITLE'], this.sT(JS_LOCALIZE['PREVIEW_ERROR_TEXT'], error.message));
                this.handleNavigation('Navigate_Previous');
            });
    }

    async generateLink() {
        this.#m_SaveContainerEl.classList.add('hide');
        this.#m_SaveLoadingEl.classList.remove('hide');

        const data = { original: this.#m_originalTextEl.value, corrected: this.#m_correctedTextEl.value, notes: JSON.stringify(this.#m_Notes), highlights: this.#m_Highlighter.serialize() };
        const url = 'store.php';

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Session': SESSION_ID },
            body: new URLSearchParams(data).toString(),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(this.statusToFriendlyText(response));
                }
                return response.text();
            })
            .then(data => {
                this.#m_SaveLinkEl.value = data;
                this.#m_SaveContainerEl.classList.remove('hide');
                this.#m_SaveLoadingEl.classList.add('hide');
            })
            .catch(error => {
                this.showModal(JS_LOCALIZE['STORE_ERROR_TITLE'], this.sT(JS_LOCALIZE['STORE_ERROR_TEXT'], error.message));
                this.handleNavigation('Navigate_Previous');
            });
    }

    async addSelectionNote() {
        let noteText;
        let doIt = true;

        try {
            noteText = await this.showAddNote('');
        } catch {
            doIt = false;
        }

        if (this.isNullOrWhitespace(noteText))
            doIt = false;

        if (doIt) {
            // Restore the cached selection range so that the highligher will actually highlight something.
            rangy.getSelection().restoreRanges(this.#m_RangeCache);

            const note = this.#m_Highlighter.highlightSelection("note", { containerElementId: 'changes' });

            if (note.length == 1)
                this.#m_Notes.push({ id: note[0].id, text: noteText });
        }

        rangy.getSelection().removeAllRanges();
        this.#m_RangeCache = null;
    }

    async editSelectionNote(target) {
        const noteHighlight = this.#m_Highlighter.getHighlightForElement(target);

        if (!noteHighlight)
            return;

        const noteObject = this.#m_Notes.find(note => note.id === noteHighlight.id);

        if (!noteObject) {
            this.#m_Highlighter.removeHighlights(noteHighlight);
            return;
        }

        let newNoteText;

        try {
            newNoteText = await this.showAddNote(noteObject.text);
        } catch {
            return;
        }

        if (this.isNullOrWhitespace(newNoteText)) {
            const response = await this.showPrompt(JS_LOCALIZE['EMPTY_NOTE_DELETE_TITLE'], JS_LOCALIZE['EMPTY_NOTE_DELETE_TEXT']);

            if (response) {
                this.#m_Highlighter.removeHighlights([noteHighlight]);
                this.#m_Notes = this.#m_Notes.filter(note => note.id !== noteHighlight.id);
            }

            return;
        }

        noteObject.text = newNoteText;
    }

    async validateCaptcha() {
        const form = document.getElementById('captcha');

        if (this.isNullOrWhitespace(form['h-captcha-response'].value))
            return false;

        const formData = new FormData(form);

        const response = await fetch('validate.php', {
            headers: { 'Session': SESSION_ID },
            method: 'POST',
            body: formData
        });

        if (!response.ok)
            console.debug(response);

        return response.ok;
    }

    showModal(title, content) {
        var normalizedContent = content.replace(/\r\n|\r|\n/g, '\n');
        var lines = normalizedContent.split("\n");

        var modalContent = document.getElementById('modal_content');
        modalContent.innerHTML = '';

        lines.forEach(function (line, index) {
            var textNode = document.createTextNode(line);
            modalContent.appendChild(textNode);

            if (index < lines.length - 1)
                modalContent.appendChild(document.createElement('br'));
        });

        document.getElementById('modal_title').textContent = title;
        document.getElementById('modal_message').checked = true;
    }
    
    showPrompt(title, content) {
        document.getElementById('prompt_title').textContent = title;
        document.getElementById('prompt_content').textContent = content;
        document.getElementById('modal_prompt').checked = true;

        return new Promise((resolve, reject) => {
            document.querySelector('div[data-modal="prompt"] button[data-action="Yes"]').onclick = () => {
                this.closeModals();
                resolve(true);
            };

            document.querySelector('div[data-modal="prompt"] button[data-action="No"]').onclick = () => {
                this.closeModals();
                resolve(false);
            };

            document.getElementById('modal_prompt').onchange = () => {
                resolve(false);
            };
        });
    }

    showAddNote(text) {
        document.getElementById('modal_note').checked = true;

        const noteTextEl = document.getElementById('modal_note_text');

        noteTextEl.value = text;

        return new Promise((resolve, reject) => {
            document.querySelector('div[data-modal="note"] button[data-action="AddNote"]').onclick = () => {
                this.closeModals();
                resolve(noteTextEl.value);
            };

            document.querySelector('div[data-modal="note"] button[data-action="Cancel"]').onclick = () => {
                this.closeModals();
                reject(false);
            };

            document.getElementById('modal_note').onchange = () => {
                reject(false);
            };
        });
    }

    closeModals() {
        var mods = document.querySelectorAll('.modal > [type=checkbox]');
        [].forEach.call(mods, function (mod) { mod.checked = false; });
    }

    isNullOrWhitespace(input) {
        return !input || !input.trim();
    }

    statusToFriendlyText(response) {
        switch (response.status) {
            case 400:
                return JS_LOCALIZE['FRIENDLY_RESPONSE_400'];
            case 401:
                return JS_LOCALIZE['FRIENDLY_RESPONSE_401'];
            case 403:
                return JS_LOCALIZE['FRIENDLY_RESPONSE_403'];
            case 429:
                return JS_LOCALIZE['FRIENDLY_RESPONSE_429'];
            case 500:
                return JS_LOCALIZE['FRIENDLY_RESPONSE_500'];
            default:
                return this.sT(JS_LOCALIZE['FRIENDLY_RESPONSE_UNKNOWN'], response.status, response.statusText);
        }
    }

    sT(template, ...values) {
        return template.replace(/%\?/g, () => values.shift());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TandemCorrect().init();
});