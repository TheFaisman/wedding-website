export async function initRSVP() {
    // Replace with your Stein Storage ID and Google Sheet tab name
    const STEIN_API_URL = 'https://api.steinhq.com/v1/storages/6a9483c492b1163e97397b1d/Groups';


    const reservedNames = ["additional guest", "mother", "father", "sister", "brother", "daughter", "son", "husband", "wife", "cousin"];

    // Fetching guest data on page load
    let optimizedGuestMap = {};
    let allSheetRows = [];

    // 1. BACKGROUND FETCH: Start downloading immediately on page load
    try {
        const response = await fetch(STEIN_API_URL);
        const sheetData = await response.json();

        if (!Array.isArray(sheetData)) {
            console.error("API did not return an array. Response was:", sheetData);
            return; 
        }

        allSheetRows = sheetData; // Keep a reference to the global list

        // 2. OPTIMIZATION PASS 1: Group everyone by their GroupID
        const groupsByID = {};
        sheetData.forEach(row => {
            if (!groupsByID[row.GroupID]) {
                groupsByID[row.GroupID] = []; 
            }
            groupsByID[row.GroupID].push(row); 
        });

        // 3. OPTIMIZATION PASS 2: Map every lowercase name directly to their full group
        sheetData.forEach(row => {
            if (row.GuestName) {
                const searchName = row.GuestName.toLowerCase().trim();
                if (!reservedNames.includes(searchName)) {
                    optimizedGuestMap[searchName] = groupsByID[row.GroupID]; 
                }
            }
        });

    } catch (error) {
        console.error("Failed to preload guest list:", error);
    }

    const searchBtn = document.getElementById('search-btn'); 
    const submitBtn = document.getElementById('submit-btn');
    const searchMsg = document.getElementById('search-msg');
    const submitMsg = document.getElementById('submit-msg');
    const firstNameInput = document.querySelector('input[name="first-name"]');
    const lastNameInput = document.querySelector('input[name="last-name"]');
    const guestsInvitedDiv = document.getElementById('guests-invited');

    searchBtn.addEventListener('click', (event) => {
        event.preventDefault(); 
        
        // Clear the slate
        guestsInvitedDiv.style.display = 'none';
        searchMsg.style.display = 'none';
        submitBtn.style.display = 'none';
        submitMsg.style.display = 'none';

        const firstName = firstNameInput.value.trim().toLowerCase();
        const lastName = lastNameInput.value.trim().toLowerCase();
        const searchName = `${firstName} ${lastName}`.trim();

        if (firstName === "" || lastName === "") {
            searchMsg.innerHTML = '<p>Both first and last name required.</p>';
            searchMsg.style.display = 'block';
            return; 
        }

        if (reservedNames.includes(searchName)) {
            searchMsg.innerHTML = '<p>Please enter a valid guest name.</p>';
            searchMsg.style.display = 'block';
            return;
        }

        const groupMembers = optimizedGuestMap[searchName];

        if (groupMembers) {
            let htmlContent = '';
            let htmlContentRefined = '';

            groupMembers.forEach(member => {
                const isChecked = ((member.Attendance === "Yes") || (member.Attendance === "") || (member.Attendance === null)) ? "checked" : "";
                const mealValue = member.MealRestrictions && member.MealRestrictions !== "None" ? member.MealRestrictions : "";
                const plusOneName = member.PlusOneName && (member.PlusOneName !== "None") ? member.PlusOneName : "";
                htmlContent += `
                  <div class="guest-card" data-guest-id="${member.GuestID}">
                    <div class="guest-card-header">
                      <span class="guest-name">${member.GuestName}</span>
                      <label class="attendance-toggle">
                        <input type="checkbox" class="attendance-checkbox" ${isChecked}>
                        <span class="custom-checkmark"></span>
                        <span class="toggle-label">Attending</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      class="guest-dietary-input" 
                      name="diet"
                      value="${mealValue}"
                      placeholder="Dietary restrictions or allergies..."
                    >
                  </div>
                `;

                htmlContentRefined += `<div class="guest-card" data-guest-id="${member.GuestID}">`;
                htmlContentRefined += `
                        <div class="guest-card-header">
                            <span class="guest-name">${member.GuestName}</span>
                            <label class="attendance-toggle">
                                <input type="checkbox" class="attendance-checkbox" ${isChecked}>
                                <span class="custom-checkmark"></span>
                                <span class="toggle-label">Attending</span>
                            </label>
                        </div>
                `
                if (reservedNames.includes(member.GuestName.toLowerCase())) {
                    htmlContentRefined += `
                        <input
                            type="text"
                            class="guest-input"
                            name="plus-one-name"
                            value="${plusOneName}"
                            placeholder="Guest's full name"
                            style="margin-bottom: 5px;"
                        >
                    `
                }

                htmlContentRefined += `
                    <input
                        type="text"
                        class="guest-input"
                        name="diet"
                        value="${mealValue}"
                        placeholder="Dietary restrictions or allergies..."
                    >
                    </div>
                `
            });

            guestsInvitedDiv.innerHTML = htmlContentRefined;
            guestsInvitedDiv.style.display = 'block';
            submitBtn.style.display = 'block';
            submitBtn.focus();

        } else {
            guestsInvitedDiv.style.display = 'none';
            submitBtn.style.display = 'none';
            searchMsg.style.display = 'block';
            searchMsg.innerHTML = '<p>Name not found. Try again</p>';
        }
    });

    submitBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        // Selected cards directly instead of 'tr' table rows
        const guestCards = guestsInvitedDiv.querySelectorAll('.guest-card');
        const updatePromises = [];
        const pendingLocalUpdates = [];

        guestCards.forEach(card => {
            const guestId = card.dataset.guestId;
            const guestName = card.querySelector('.guest-name').textContent.trim();
            const isAttending = card.querySelector('.attendance-checkbox').checked;
            const dietaryInput = card.querySelector('input[name="diet"]').value.trim();
            const plusOneInput = (card.querySelector('input[name="plus-one-name"]')?.value || "").trim();

            const attendanceStatus = isAttending ? "Yes" : "No";
            const mealStatus = dietaryInput || "None";
            const plusOneName = plusOneInput || "N/A";

            pendingLocalUpdates.push({
                GuestID: guestId,
                GuestName: guestName,
                Attendance: attendanceStatus,
                MealRestrictions: mealStatus,
                PlusOneName: plusOneName
            });

            // STEIN UPDATE API: Uses PUT method with condition and set blocks
            const updatePromise = fetch(STEIN_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    condition: { GuestID: guestId },
                    set: {
                        GuestName: guestName,
                        Attendance: attendanceStatus,
                        MealRestrictions: mealStatus,
                        PlusOneName: plusOneName
                    }
                })
            }).then(res => res.json());

            updatePromises.push(updatePromise);
        });

        try {
            submitBtn.textContent = "Submitting...";
            submitBtn.disabled = true;

            await Promise.all(updatePromises);

            // Synchronize local in-memory cache
            pendingLocalUpdates.forEach(update => {
                const lookupName = update.GuestName.toLowerCase().trim();
                const group = optimizedGuestMap[lookupName];
                
                if (group) {
                    const person = group.find(m => m.GuestName === update.GuestName);
                    if (person) {
                        person.Attendance = update.Attendance;
                        person.MealRestrictions = update.MealRestrictions;
                        person.PlusOneName = update.PlusOneName;
                    }
                }
            });

            submitMsg.innerHTML = '<p>RSVP submitted successfully!</p>';
            submitMsg.style.display = 'block';

        } catch (error) {
            console.error("Error updating RSVP:", error);
            submitMsg.innerHTML = '<p>RSVP submission failed.</p>';
            submitMsg.style.display = 'block';
        } finally {
            submitBtn.textContent = "Submit";
            submitBtn.disabled = false;
        }
    });
}
