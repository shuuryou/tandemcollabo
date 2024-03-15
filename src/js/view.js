class TandemCorrectView {
    #m_Highlighter;
    #m_Notes;

    constructor() { }

    init() {
        rangy.init();

        this.#m_Highlighter = rangy.createHighlighter();
        this.#m_Notes = JSON.parse(NOTE_DATA);

        this.#m_Highlighter.addClassApplier(rangy.createClassApplier('note', {
            ignoreWhiteSpace: true,
            elementTagName: 'span',
            elementProperties: {
                onclick: (event) => {
                    this.viewSelectionNote(event.target);
                }
            }
        }));

        this.#m_Highlighter.deserialize(HIGHLIGHT_DATA);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const viewerElement = document.getElementById('Viewer');
        viewerElement.addEventListener('click', (event) => {
            const purpose = event.target.getAttribute('data-purpose');
            if (purpose) {
                this.handleButton(purpose);
            }
        });

        document.addEventListener('keydown', (event) => { this.onKeyDown(event); });
    }

    handleButton(purpose) {
        const articles = document.querySelectorAll('article[data-view]');
        articles.forEach((article) => {
            if (article.dataset.view == purpose)
                article.classList.remove('hide');
            else
                article.classList.add('hide');
        });
    }

    onKeyDown(event) {
        if (event.key != 'Escape')
            return;

        this.closeModals();
    }

    async viewSelectionNote(target) {
        const noteHighlight = this.#m_Highlighter.getHighlightForElement(target);

        if (!noteHighlight)
            return;

        const noteObject = this.#m_Notes.find(note => note.id == noteHighlight.id);

        if (!noteObject) {
            this.#m_Highlighter.removeHighlights(noteHighlight);
            return;
        }

        this.showModal('Correction Note', noteObject.text);
    }

    showModal(title, content) {
        document.getElementById('modal_title').textContent = title;
        document.getElementById('modal_content').textContent = content;
        document.getElementById('modal_message').checked = true;
    }

    closeModals() {
        var mods = document.querySelectorAll('.modal > [type=checkbox]');
        [].forEach.call(mods, function (mod) { mod.checked = false; });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TandemCorrectView().init();
});