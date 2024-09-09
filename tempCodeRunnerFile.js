// Function to display data in a table format in the console
function displayDataAsTable(data) {
    if (data && Array.isArray(data) && data.length > 0) {
        console.table(data);
    } else {
        console.log('No data to display');
    }
}

// Function to sort data by Rent in ascending order
const sortByRentAscending = () => {
    dbData.sort((a, b) => a.Rent - b.Rent);
    console.log("Data sorted in ascending order by Rent:");
    console.table(dbData);
}

// Function to sort data by Rent in descending order
const sortByRentDescending = () => {
    dbData.sort((a, b) => b.Rent - a.Rent);
    console.log("Data sorted in descending order by Rent:");
    console.table(dbData);
}

// Secondary menu for sorting options
function sortMenu() {
    console.log('\nSort Menu');
    console.log('1: Sort by Rent (Ascending)');
    console.log('2: Sort by Rent (Descending)');
    console.log('3: Return to Main Menu');
    rl.question('Enter your choice: ', (answer) => {
        switch(answer) {
            case '1':
                sortByRentAscending();
                break;
            case '2':
                sortByRentDescending();
                break;
            case '3':
                mainMenu();
                return;
            default:
                console.log('Invalid choice, please try again.');
        }
        sortMenu(); // Go back to the sort menu
    });
}

// Main menu function
function mainMenu() {
    console.log('\nMain Menu');
    console.log('1: Display Data');
    console.log('2: Sort Data');
    console.log('3: Exit');
    rl.question('Enter your choice: ', (answer) => {
        switch(answer) {
            case '1':
                console.table(dbData);
                break;
            case '2':
                sortMenu();
                return;
            case '3':
                console.log('Exiting...');
                rl.close();            return;
                default:
                    console.log('Invalid choice, please try again.');
            }
            mainMenu(); // Go back to the main menu
        });
      }

      // Run the main menu function
      mainMenu();   