export async function initRSVP() {
    const rsvpBtn = document.getElementById('rsvp-btn');
    const rsvpForm = document.getElementById('rsvp-section'); 
    rsvpBtn.addEventListener('click', (event) => {
        event.preventDefault();
        rsvpForm.style.display = 'block';
    });


    // Fetching guest data on page load
    let optimizedGuestMap = {};
    let allSheetRows = [];

    // 1. BACKGROUND FETCH: Start downloading immediately on page load from the single consolidated sheet
    try {
        const response = await fetch('https://sheetdb.io/api/v1/uaea0471hklew');
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
                optimizedGuestMap[searchName] = groupsByID[row.GroupID]; 
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

        const groupMembers = optimizedGuestMap[searchName];

        if (groupMembers) {
            let tableHTML = `
                <table>
                    <tr>
                        <th>Guest Invited</th>
                        <th>Attendance</th>
                        <th>Dietary Restrictions*</th>
                    </tr>
            `;

            groupMembers.forEach(member => {
                // Pre-check attendance if they previously submitted "Yes"
                const isChecked = ((member.Attendance === "Yes") || (member.Attendance === "")) ? "checked" : "";
                const mealValue = member.MealRestrictions && member.MealRestrictions !== "None" ? member.MealRestrictions : "";

                tableHTML += `
                    <tr>
                        <td class="guest-name">${member.GuestName}</td>
                        <td><input name="attendance" type="checkbox" ${isChecked} /></td>
                        <td><input name="diet" value="${mealValue}" /></td>
                    </tr>
                `;
            });

            tableHTML += `</table>`;
            guestsInvitedDiv.innerHTML = tableHTML;
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

        const rows = guestsInvitedDiv.querySelectorAll('tr');
        const updatePromises = [];
        const pendingLocalUpdates = []; // <-- Store updates locally to keep the map in sync

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const guestName = row.querySelector('.guest-name').textContent;
            const isAttending = row.querySelector('input[name="attendance"]').checked;
            const dietaryInput = row.querySelector('input[name="diet"]').value.trim();

            const attendanceStatus = isAttending ? "Yes" : "No";
            const mealStatus = dietaryInput || "None";

            // Save exactly what we are sending so we can update our local map later
            pendingLocalUpdates.push({
                GuestName: guestName,
                Attendance: attendanceStatus,
                MealRestrictions: mealStatus
            });

            // SheetDB allows updating records using a column identifier like GuestName
            const updatePromise = fetch(`https://sheetdb.io/api/v1/uaea0471hklew/GuestName/${encodeURIComponent(guestName)}`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        Attendance: attendanceStatus,
                        MealRestrictions: mealStatus
                    }
                })
            }).then(res => res.json());

            updatePromises.push(updatePromise);
        }

        try {
            submitBtn.textContent = "Submitting...";
            submitBtn.disabled = true;

            // Wait for all group member updates to complete concurrently
            await Promise.all(updatePromises);

            // SUCCESS: Now we update our local JavaScript memory so the UI stays synced 
            // without needing to make another expensive background fetch.
            pendingLocalUpdates.forEach(update => {
                const lookupName = update.GuestName.toLowerCase().trim();
                const group = optimizedGuestMap[lookupName];
                
                if (group) {
                    // Find the exact person object inside the group array and update properties
                    const person = group.find(m => m.GuestName === update.GuestName);
                    if (person) {
                        person.Attendance = update.Attendance;
                        person.MealRestrictions = update.MealRestrictions;
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

