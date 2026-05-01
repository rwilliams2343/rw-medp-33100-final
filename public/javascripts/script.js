document.addEventListener('DOMContentLoaded', () => {

    //onboarding slides
    const onboarding = document.querySelector('.onboarding')
    const slides = new Flickity(onboarding, {
        freeScroll: true,
        contain: true,
        draggable: false
    })

    //close onboarding
    const onboardingButtons = document.querySelectorAll('.close_onboarding')
    const onboardingContainer = document.querySelector('#onboarding_container')

    onboardingButtons.forEach(button => {
        button.addEventListener('click', () => {
            onboardingContainer.style.display = 'none'
        })
    })

    //search
    const searchForm = document.querySelector('#searchBar')
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(searchForm)
        const searchInput = formData.get('searchText')

        const newEntries = await getEntries(searchInput);

        displayEntries(newEntries)
    })

    // entry pop up button
    const entryButton = document.querySelector('#entryButton')
    const entryContainer = document.querySelector('#newEntryContainer')
    entryButton.addEventListener('click', () => {
        entryContainer.style.display = 'block'
    })

    //click cancel button to close entry form
    const cancelEntry = document.querySelector('#entryCancel')
    cancelEntry.addEventListener('click', () => {
        entryContainer.style.display = 'none'
    })

    window.addEventListener('click', (event) => {
        if (event.target == entryContainer) {
            entryContainer.style.display = 'none'
        }
    })

    //create a new entry
    const newEntryForm = document.querySelector('#new-entry')
    newEntryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(newEntryForm);

        const formDataObject = {
            game_name: formData.get('nameInput'),
            image_url: formData.get('imageInput'),
            author: formData.get('authorInput'),
            platform: formData.get('platformInput'),
            entry_text: formData.get('bodyInput')
        }

        fetch('/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        }).then(() => {
        location.reload();
        })
    })

    // update entry
    const entries = document.querySelectorAll(".entry");
    entries.forEach(entry => {
        const edit_button = entry.querySelector(".edit_button");
        edit_button.addEventListener('click', () => {

            //edit name
            const gameName = entry.querySelector(".game_name");
            const gameEdit = document.createElement('input');
            gameEdit.value = gameName.innerText;
            gameName.innerHTML = "";
            gameName.appendChild(gameEdit);

            //edit image url
            const image = entry.querySelector('.game_image');
            const image_url = entry.querySelector('.game_image_url')
            const imageEdit = document.createElement('input');
            image_url.style.display = 'none'
            imageEdit.value = image_url.src;
            image.appendChild(imageEdit);

            //edit author
            const username = entry.querySelector(".author_text");
            const usernameEdit = document.createElement('input');
            usernameEdit.value = username.innerText;
            username.innerHTML = "";
            username.appendChild(usernameEdit);

            //edit platform
            const platform = entry.querySelector(".platform_text");
            const platformEdit = document.createElement('input');
            platformEdit.value = platform.innerText;
            platform.innerHTML = "";
            platform.appendChild(platformEdit);

            //edit body text
            const body = entry.querySelector(".entry_text");
            const bodyEdit = document.createElement('textarea');
            bodyEdit.value = body.innerText;
            bodyEdit.rows = "4"
            bodyEdit.cols = "45"
            body.innerHTML = "";
            body.appendChild(bodyEdit);

            //hide date, delete button, edit button

            const date = entry.querySelector('.date')
            // const author = entry.querySelector('.author')
            // const platform = entry.querySelector('.platform')
            const delete_button = entry.querySelector('.delete_button')

            date.style.display = 'none';
            // author.style.display = 'none';
            // platform.style.display = 'none';
            delete_button.style.display = 'none';
            edit_button.style.display = 'none';

            //save changes
            const saveButton = document.createElement('button')
            saveButton.classList.add("saveButton");
            saveButton.classList.add("buttons")
            saveButton.innerText = "Save Changes"
            saveButton.addEventListener('click', async () => {
                const updatedGame = gameEdit.value;
                const updatedUrl = imageEdit.value;
                const updatedAuthor = usernameEdit.value;
                const updatedPlatform = platformEdit.value;
                const updatedBody = bodyEdit.value;

                const updatedInfo = {
                    id: entry.id,
                    game_name: updatedGame,
                    image_url: updatedUrl,
                    author: updatedAuthor,
                    platform: updatedPlatform,
                    entry_text: updatedBody
                }
                await updateEntry(updatedInfo)
                location.reload();
            })
            entry.appendChild(saveButton)
        });

        // delete entry
        const deleteButton = entry.querySelector('.delete_button')
        deleteButton.addEventListener('click', async () => {
            await deleteEntry(entry.id)
            location.reload();
        })
    });

    //display searched entries
    function displayEntries(entries) {
        const container = document.querySelector('.container');
        container.innerHTML = '';
        entries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.classList.add('entry');
            entryElement.id = entry._id;
            entryElement.innerHTML = `
                <div class="top_line">
                    <h3 class="game_name">${entry.game_name}</h3>
                    <button class="delete_button">Delete</button><br>   
                </div>
                <div class="game_image">
                    <img class="game_image_url" alt="image of ${entry.game_name}" src="${entry.image_url}">
                </div>
                <p class="author">by <span class="author_text">${entry.author}</span></p>
                <p class="date">Created On: ${entry.date_created}</p>
                <p class="platform">Played On: <span class="platform_text">${entry.platform}</span></p>
                <p class="entry_text">${entry.entry_text}</p>
                <button class="edit_button">Edit</button>
            `;

            const deleteButton = entryElement.querySelector('.delete_button')
            deleteButton.addEventListener('click', async () => {
            console.log('delete clicked!')
            await deleteEntry(entryElement.id)
            location.reload();
        })
            
            container.prepend(entryElement);
        })
    }

    //gsap animations
    gsap.from(onboarding, {duration: 2, opacity: 0, top: 250})

    //fetch responses
    async function getEntries(searchParams) {
        const response = await fetch('/entries?search=' + searchParams)
        const entries = await response.json()

        return entries
    }

    async function updateEntry(info) {
       await fetch('/entries', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(info)
        })
    }

    async function deleteEntry(entryID) {
        console.log('deleteEntry called!');
        console.log('deleting entry with id:', entryID);
        await fetch('/entries/' + entryID, {
            method: 'DELETE',
            // headers: {
            //     'Content-Type': 'application/json'
            // },
            // body: JSON.stringify(info)
        })
    }
})
