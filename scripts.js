document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab DOM elements
    const rsvpDialog = document.getElementById('rsvp-dialog');
    const searchBtn = document.getElementById('search-btn');
    const guestsInvitedDiv = document.getElementById('guests-invited');
    const submitBtn = document.getElementById('submit-btn');
    const firstNameInput = document.querySelector('input[name="first-name"]');
    const lastNameInput = document.querySelector('input[name="last-name"]');

    // 2. Hide the guest container by default
    guestsInvitedDiv.style.display = 'none';

    // 3. Mock database
    const guestDatabase = {
        "dana bakri": ["Dana Bakri", "Faisal Naqaweh"],
        "john doe": ["John Doe", "Jane Doe", "Baby Doe"]
    };

    // 4. RESET LOGIC: Listens for whenever the dialog closes
    rsvpDialog.addEventListener('close', () => {
        firstNameInput.value = '';       // Clear first name field
        lastNameInput.value = '';        // Clear last name field
        guestsInvitedDiv.innerHTML = ''; // Wipe out generated table
        guestsInvitedDiv.style.display = 'none'; // Hide the div container again
        submitBtn.style.display = 'none';
    });

    // 5. Search button click logic
    searchBtn.addEventListener('click', (event) => {
        event.preventDefault(); 
        
        const firstName = firstNameInput.value.trim().toLowerCase();
        const lastName = lastNameInput.value.trim().toLowerCase();
        const searchName = `${firstName} ${lastName}`.trim();

        if (guestDatabase[searchName]) {
            let tableHTML = `
                <table>
                    <tr>
                        <th>Guest Invited</th>
                        <th>Attendance</th>
                        <th>Vegetarian</th>
                    </tr>
            `;

            guestDatabase[searchName].forEach(guestName => {
                tableHTML += `
                    <tr>
                        <td>${guestName}</td>
                        <td><input name="attendance" type="checkbox" checked /></td>
                        <td><input name="veggie" type="checkbox" /></td>
                    </tr>
                `;
            });

            tableHTML += `</table>`;

            guestsInvitedDiv.innerHTML = tableHTML;
            guestsInvitedDiv.style.display = 'block';
            submitBtn.style.display = 'block';
        } else {
            // This is the case in which there is no match. We need to check against a couple cases.
            // 1. Is one of the fields empty? 
            guestsInvitedDiv.style.display = 'block';
            let errMsg = "";
            if (firstName == "" || lastName == "") {
                errMsg = '<p>Both first and last name required.</p>';
            } else {
                errMsg = '<p>You\'re not invited. Oops.</p>';
            }
            guestsInvitedDiv.innerHTML = errMsg; 
            submitBtn.style.display = 'none';
        }
    });
});
