const API_URL = "https://quick-note-app-dboa.onrender.com/notes";

const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesContainer = document.getElementById("notesContainer");
const refreshBtn = document.getElementById("refreshBtn");


// Load notes
async function loadNotes() {
    try {
        notesContainer.innerHTML =
            '<p class="loading">Loading notes...</p>';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load notes");
        }

        const notes = await response.json();

        displayNotes(notes);

    } catch (error) {

        console.error(error);

        notesContainer.innerHTML =
            '<p class="empty">Unable to load notes.</p>';
    }
}



// Display notes
function displayNotes(notes) {

    if (notes.length === 0) {

        notesContainer.innerHTML =
            '<p class="empty">No notes yet. Create your first note!</p>';

        return;
    }

    notesContainer.innerHTML = notes
        .map(note => {

            const date = new Date(note.createdAt)
                .toLocaleString();

            return `
                <article class="note-card">

                    <h3>${escapeHtml(note.title)}</h3>

                    <p>${escapeHtml(note.content)}</p>

                    <div class="note-date">
                        Created: ${date}
                    </div>

                    <div class="note-actions">

                        <button
                            class="edit-btn"
                            onclick="editNote('${note.id}', '${escapeHtml(note.title)}', '${escapeHtml(note.content)}')"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteNote('${note.id}')"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                </article>
            `;
        })
        .join("");
}

// Create note
noteForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert("Please enter both title and content.");
        return;
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title,
                content
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create note");
        }

        noteForm.reset();

        await loadNotes();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
});


// Delete note
async function deleteNote(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete note");
        }

        await loadNotes();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}

// Edit note
async function editNote(id, oldTitle, oldContent) {

    const title = prompt("Enter new title:", oldTitle);

    if (title === null) {
        return;
    }

    const content = prompt("Enter new content:", oldContent);

    if (content === null) {
        return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
        alert("Title and content are required.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: trimmedTitle,
                content: trimmedContent
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to update note"
            );
        }

        alert("Note updated successfully!");

        await loadNotes();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}


// Refresh button
refreshBtn.addEventListener("click", loadNotes);


// Basic HTML escaping
function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Initial load
loadNotes();