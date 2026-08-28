document.addEventListener('DOMContentLoaded', async () => {
    // 1. Grab DOM elements
    const rsvpDialog = document.getElementById('rsvp-dialog'); // Restored element
    const searchBtn = document.getElementById('search-btn');
    const guestsInvitedDiv = document.getElementById('guests-invited');
    const submitBtn = document.getElementById('submit-btn');
    const firstNameInput = document.querySelector('input[name="first-name"]');
    const lastNameInput = document.querySelector('input[name="last-name"]');

    // Hide containers initially
    guestsInvitedDiv.style.display = 'none';
    
    // We will store our highly-optimized data here
    let optimizedGuestMap = {};

    // RESET LOGIC: Listens for whenever the dialog closes to clear previous searches
    if (rsvpDialog) {
        rsvpDialog.addEventListener('close', () => {
            firstNameInput.value = '';       
            lastNameInput.value = '';        
            guestsInvitedDiv.innerHTML = ''; 
            guestsInvitedDiv.style.display = 'none'; 
            submitBtn.style.display = 'none'; // Ensure submit button hides on close
        });
    }

    // 1. BACKGROUND FETCH: Start downloading immediately on page load
    try {
        // UPDATED: Replace 'YOUR_API_ID' with your generated SheetDB ID
        // The ?sheet=Groups ensures it only pulls from the correct tab
        const response = await fetch('https://sheetdb.io/api/v1/uaea0471hklew?sheet=Groups');
        const sheetData = await response.json();

        // 2. OPTIMIZATION PASS 1: Group everyone by their GroupID
        const groupsByID = {};
        sheetData.forEach(row => {
            if (!groupsByID[row.GroupID]) {
                groupsByID[row.GroupID] = []; // Create the array if it doesn't exist
            }
            groupsByID[row.GroupID].push(row); // Add the person to their group
        });

        // 3. OPTIMIZATION PASS 2: Map every lowercase name directly to their full group
        sheetData.forEach(row => {
            // Ensures safety just in case there are blank rows in the Google Sheet
            if (row.GuestName) {
                const searchName = row.GuestName.toLowerCase().trim();
                optimizedGuestMap[searchName] = groupsByID[row.GroupID]; 
            }
        });

    } catch (error) {
        console.error("Failed to preload guest list:", error);
    }

    // 4. SEARCH LOGIC: Now instantaneous
    searchBtn.addEventListener('click', (event) => {
        event.preventDefault(); 
        
        const firstName = firstNameInput.value.trim().toLowerCase();
        const lastName = lastNameInput.value.trim().toLowerCase();
        const searchName = `${firstName} ${lastName}`.trim();

        if (firstName === "" && lastName === "") {
            guestsInvitedDiv.innerHTML = '<p>Both first and last name required.</p>';
            guestsInvitedDiv.style.display = 'block';
            submitBtn.style.display = 'none';
            return; 
        }

        // INSTANT LOOKUP: No looping required! 
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
                tableHTML += `
                    <tr>
                        <td>${member.GuestName}</td>
                        <td><input name="attendance" type="checkbox" checked /></td>
                        <td><input name="diet" /></td>
                    </tr>
                `;
            });

            tableHTML += `</table>`;
            guestsInvitedDiv.innerHTML = tableHTML;
            guestsInvitedDiv.style.display = 'block';
            submitBtn.style.display = 'block';

        } else {
            guestsInvitedDiv.innerHTML = '<p>You\'re not invited. Oops.</p>';
            guestsInvitedDiv.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    });
});
