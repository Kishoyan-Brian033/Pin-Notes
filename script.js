function pinNotes() {
    const noteText = document.getElementById('note').value.trim();
    const color = document.getElementById('color').value;
    const notesContainer = document.getElementById('notes-container');

    if (noteText === '') {
        alert('Please write a note before pinning.');
        return;
    }

    const noteElement = createNoteElement(noteText, color);

    // Set default position for new note
    noteElement.style.left = '10px';
    noteElement.style.top = '10px';

    notesContainer.appendChild(noteElement);

    // Save note to localStorage
    let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    savedNotes.push({ text: noteText, color: color, left: 10, top: 10 });
    localStorage.setItem('notes', JSON.stringify(savedNotes));

    // Clear the textarea after pinning
    document.getElementById('note').value = '';
}

function createNoteElement(text, color, left = null, top = null) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.style.backgroundColor = color;

    if (left !== null && top !== null) {
        noteElement.style.left = left + 'px';
        noteElement.style.top = top + 'px';
    }

    // Create close icon
    const closeIcon = document.createElement('span');
    closeIcon.className = 'close';
    closeIcon.innerHTML = '&times;';
    closeIcon.title = 'Remove note';
    closeIcon.onclick = function() {
        removeNote(noteElement, text, color);
    };

    // Create note content container
    const noteContent = document.createElement('div');
    noteContent.className = 'note-content';
    noteContent.textContent = text;

    noteElement.appendChild(closeIcon);
    noteElement.appendChild(noteContent);

    // Add drag functionality
    addDragFunctionality(noteElement, text, color);

    return noteElement;
}

function addDragFunctionality(noteElement, text, color) {
    let offsetX, offsetY;
    let isDragging = false;

    noteElement.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('close')) {
            return; // Don't drag when clicking close button
        }
        isDragging = true;
        offsetX = e.clientX - noteElement.offsetLeft;
        offsetY = e.clientY - noteElement.offsetTop;
        noteElement.style.transition = 'none'; // Disable transition while dragging
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });

    function mouseMoveHandler(e) {
        if (!isDragging) return;
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        // Keep note within container bounds
        const container = document.getElementById('notes-container');
        const containerRect = container.getBoundingClientRect();
        const noteRect = noteElement.getBoundingClientRect();

        if (newLeft < 0) newLeft = 0;
        else if (newLeft + noteRect.width > containerRect.width) newLeft = containerRect.width - noteRect.width;

        if (newTop < 0) newTop = 0;
        else if (newTop + noteRect.height > containerRect.height) newTop = containerRect.height - noteRect.height;

        noteElement.style.left = newLeft + 'px';
        noteElement.style.top = newTop + 'px';
    }

    function mouseUpHandler(e) {
        if (!isDragging) return;
        isDragging = false;
        noteElement.style.transition = 'all 0.3s ease'; // Re-enable transition

        // Save updated position to localStorage
        let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
        for (let note of savedNotes) {
            if (note.text === text && note.color === color) {
                note.left = parseInt(noteElement.style.left, 10);
                note.top = parseInt(noteElement.style.top, 10);
                break;
            }
        }
        localStorage.setItem('notes', JSON.stringify(savedNotes));

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }
}

function clearAllNotes() {
    const notesContainer = document.getElementById('notes-container');
    while (notesContainer.firstChild) {
        notesContainer.removeChild(notesContainer.firstChild);
    }
    // Clear localStorage
    localStorage.removeItem('notes');
}

function loadNotes() {
    const notesContainer = document.getElementById('notes-container');
    let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    savedNotes.forEach(note => {
        const noteElement = createNoteElement(note.text, note.color, note.left, note.top);
        notesContainer.appendChild(noteElement);
    });
}

window.onload = function() {
    loadNotes();
};
