//functional Script

//Importings
const fs = require('fs');
const readline = require('readline');



// Read and parse the JSON data from the file
const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const houseRentArray = readJsonFile('House_Rent_Dataset.json');

// Create an interface for reading from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to truncate string to a fixed length
const truncateString = (str, num) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
};

// Function to display data with pagination
function displayPaginatedTable(data, currentPage = 1) {
  const pageSize = 500;  // Set the number of items per page
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  console.table(paginatedData);
  console.log(`Page ${currentPage} of ${totalPages}`);

  rl.question('Next page (n), Previous page (p), Main menu (m): ', choice => {
      if (choice === 'n' && currentPage < totalPages) {
          displayPaginatedTable(data, currentPage + 1);
      } else if (choice === 'p' && currentPage > 1) {
          displayPaginatedTable(data, currentPage - 1);
      } else if (choice === 'm') {
          mainMenu(houseRentArray);  // Go back to main menu
      } else {
          console.log('Invalid choice.');
          displayPaginatedTable(data, currentPage);  // Repeat the current page
      }
  });
}


/************************************************************* DISPLAY FUNCTION *********************************************************/

// Modify displayCleanTable to use pagination
const displayCleanTable = (data) => {
if (data && Array.isArray(data) && data.length > 0) {
    const truncatedData = data.map(item => ({
        ...item,
        Area_Locality: truncateString(item.Area_Locality, 20),
        Point_of_Contact: truncateString(item.Point_of_Contact, 20)
    }));
    displayPaginatedTable(truncatedData);  // Start with first page
} else {
    console.log('No data to display');
}
};



/************************************************************* SORTING FUNCTIONS *********************************************************/



// Function to sort data based on a Rent in Descending Order
const sortByRentDescending = (data) => {
    // Creating a new array to avoid mutating the original data
  return [...data]
    .map(item => ({ 
        Rented_On: item.Posted_On,
        BHK: item.BHK,
        Rent: item.Rent,
        City: item.City
    }))
    .sort((a, b) => b.Rent - a.Rent);
};

// Function to sort data based on a Rent in Ascending Order 
const sortByRentAscending = (data) => {
  return [...data]
    .map(item => ({ 
        Rented_On: item.Posted_On,
        BHK: item.BHK,
        Rent: item.Rent,
        City: item.City
    }))
    .sort((a, b) => a.Rent - b.Rent);
};



//Function to sort data based on a BHK in Ascending Order
const sortByBHKAscending = (data) => {
  return [...data]
      .map(item => ({ 
        Rented_On: item.Posted_On,
        BHK: item.BHK,
        City: item.City,
        furnishing: item.Furnishing_Status
      }))
      .sort((a, b) => a.BHK - b.BHK); 

  
};



//Function to sort data based on a BHK in Descending Order 
const sortByBHKDescending = (data) => {
  return [...data]
      .map(item => ({ 
        Rented_On: item.Posted_On,
        BHK: item.BHK,
        City: item.City,
        furnishing: item.Furnishing_Status
      }))
      .sort((a, b) => b.BHK - a.BHK); 

};



//Funtion to sort data based on House Size in Ascending order 
const sortBySizeAscending = (data) => {
  return [...data]
      .map(item => ({ 
        Rented_On: item.Posted_On,
      size: item.Size,
      City: item.City,
      Floor: item.Floor
      }))
      .sort((a, b) => a.size - b.size); 


};




//Funtion to sort data based on House Size in Descending order 
const sortBySizeDescending = (data) => {
  return [...data]
      .map(item => ({ 
        Rented_On: item.Posted_On,
      size: item.Size,
      City: item.City,
      Floor: item.Floor
      }))
      .sort((a, b) => b.size - a.size); 


};





/************************************************************* FILTER FUNCTIONS **********************************************************/


// Filter Rentals by City (Pure Function)
const filterRentalsByCity = (data, city) => 
  data.filter(item => item.City.toLowerCase() === city.toLowerCase());

// Filter Rentals by Rent Range (Pure Function)
const filterRentalsByRentRange = (data, minRent, maxRent) => 
  data.filter(item => item.Rent >= minRent && item.Rent <= maxRent);

// Filter Rentals by BHK (Pure Function)
const filterRentalsByBHK = (data, bhk) => 
  data.filter(item => parseInt(item.BHK) === bhk);



/************************************************************* CURRIED FUNCTIONS *********************************************************/

//Curried Function for Incremental Increase Rental Checking 
function applyIncrementalRentIncrease(percentageIncrease) {
  return function(data) {
      return data.map(rental => ({
          Rent: Math.round(rental.Rent + rental.Rent * (percentageIncrease / 100)),
          City: rental.City,
          Posted_On: rental.Posted_On
      }));
  }
}

//Curried Function to Filter BHK AND CITY 
function filterByBHKAndCity(bhk) {
  return function(city) {
      return function(data) {
          return data.filter(rental => 
              parseInt(rental.BHK) === bhk && 
              rental.City.toLowerCase() === city.toLowerCase()
          );
      }
  }
}


//Curried function for rent range and furnishing status 
function filterByRentRangeAndFurnishing(minRent, maxRent) {
  return function(furnishingStatus) {
      return function(data) {
          return data.filter(rental =>
              rental.Rent >= minRent &&
              rental.Rent <= maxRent &&
              rental.Furnishing_Status.toLowerCase() === furnishingStatus.toLowerCase()
          );
      }
  }
}


// The Curried Function for Advanced Search
function advancedSearch({ bhk, city, maxRent }) {
  return function(data) {
      return data.filter(rental => {
          return (bhk ? parseInt(rental.BHK) === bhk : true) &&
                 (city ? rental.City.toLowerCase() === city.toLowerCase() : true) &&
                 (maxRent ? rental.Rent <= maxRent : true);
      });
  }
}



/************************************************************* RECURRSIVE FUNCTIONS ***************************************************/

//Function to find the Max rent for each BHK
function findMaxRentForBHK(rentals, bhk, index = 0, maxRent = 0) {
  if (index >= rentals.length) {
      return maxRent; // Base case: reached the end of the list
  }
  const currentRental = rentals[index];
  const currentBHK = parseInt(currentRental.BHK);
  const currentRent = currentRental.Rent;

  if (currentBHK === bhk) {
      maxRent = Math.max(maxRent, currentRent);
  }
  return findMaxRentForBHK(rentals, bhk, index + 1, maxRent); // Recursive case
}



//Function to calculate the number of listings in each state
function countListingsByCity(data, counts = {}, index = 0) {
  // Base case: if index is beyond the length of the data, return the counts object
  if (index === data.length) {
      return counts;
  }

  // Check if the current item is an array (nested structure)
  if (Array.isArray(data[index])) {
      // Recursively count listings within the nested array
      counts = countListingsByCity(data[index], counts);
  } else {
      // Increment the count for the city of the current listing
      const city = data[index].City.trim().toLowerCase();
      counts[city] = (counts[city] || 0) + 1;
  }
  
  // Recursive case: proceed to the next item
  return countListingsByCity(data, counts, index + 1);
}




/************************************************************* REDUCE FUNCTIONS ***************************************************/

/*//Function to calculate the average rent in each city 
const calculateAverageRentByCity = (rentalData) => {
  const totalsByCity = rentalData.reduce((acc, { City, Rent }) => {
    const city = City.trim().toLowerCase();
    // Parse Rent as a float and check if it's a valid number
    const rentValue = parseFloat(Rent);
    if (isNaN(rentValue)) {
      console.error(`Skipping invalid rent value for city ${City}`);
      return acc;
    }
    if (!acc[city]) {
      acc[city] = { totalRent: 0, count: 0 };
    }
    acc[city].totalRent += rentValue;
    acc[city].count += 1;
    return acc;
  }, {});

  const averageRents = Object.entries(totalsByCity).map(([city, { totalRent, count }]) => ({
    City: city.charAt(0).toUpperCase() + city.slice(1),
    Average_Rent: count > 0 ? (totalRent / count).toFixed(2) : 'No data'
  }));

  return averageRents;
};*/


// Function to calculate the average rent in each city, filtering out invalid rent values
const calculateAverageRentByCity = (rentalData) => {
  const validRentals = rentalData.filter(({ Rent }) => !isNaN(parseFloat(Rent)));

  const totalsByCity = validRentals.reduce((acc, { City, Rent }) => {
    const city = City.trim().toLowerCase();
    const rentValue = parseFloat(Rent);

    if (!acc[city]) {
      acc[city] = { totalRent: 0, count: 0 };
    }
    acc[city].totalRent += rentValue;
    acc[city].count += 1;
    return acc;
  }, {});

  const averageRents = Object.entries(totalsByCity).map(([city, { totalRent, count }]) => ({
    City: city.charAt(0).toUpperCase() + city.slice(1),
    Average_Rent: count > 0 ? (totalRent / count).toFixed(2) : 'No data'
  }));

  return averageRents;
};


//Calculate the average rent for each BHK category 
const calculateAverageRentPerBHKCategory = (rentalData) => {
  const totalsPerBHK = rentalData.reduce((acc, { BHK, Rent }) => {
    // Ensure BHK is a valid number
    const bhkValue = parseInt(BHK);
    // Ensure Rent is a valid number
    const rentValue = parseFloat(Rent);

    if (!isNaN(bhkValue) && !isNaN(rentValue)) {
      if (!acc[bhkValue]) {
        acc[bhkValue] = { totalRent: 0, count: 0 };
      }
      acc[bhkValue].totalRent += rentValue;
      acc[bhkValue].count += 1;
    } else {
      // Log a warning if BHK or Rent is invalid
      console.warn(`Skipping invalid BHK or Rent value. BHK: ${BHK}, Rent: ${Rent}`);
    }

    return acc;
  }, {});

  // Calculate the average rent for each BHK category
  const averageRentPerBHK = Object.keys(totalsPerBHK).reduce((acc, bhk) => {
    const { totalRent, count } = totalsPerBHK[bhk];
    acc[bhk] = count > 0 ? (totalRent / count).toFixed(2) : 'No data';
    return acc;
  }, {});

  return averageRentPerBHK;
};

//Find the listing with the max sq feet size of the house in the entire dataset 
const findListingWithMaximumSize = (rentalData) => {
  const maxListing = rentalData.reduce((acc, listing) => {
    // Ensure the Size field exists and is a number
    if (listing.Size && !isNaN(listing.Size)) {
      const sizeValue = parseFloat(listing.Size); // Convert to float
      if (acc === null || sizeValue > acc.Size) {
        return listing; // Current listing has a larger size
      }
    } else {
      // Log a message if the Size field is invalid or not a number
      console.warn(`Invalid size for listing: ${JSON.stringify(listing)}`);
    }
    return acc; // Keep the current maximum listing
  }, null); // Initialize accumulator to null

  return maxListing; // Will be the listing with the largest size or null
};


//Functional Composition - to filter listings to a specific city 
// Compose the functions (from right to left)
const compose = (...fns) => (x) =>
  fns.reduceRight((v, f) => f(v), x);

// Create a composed function for a specific operation
const filterAndPickPropertiesByCity = (city, props) => compose(
  pickProperties(props),
  filterByCity(city)
);







/************************************************************* Menus *****************************************************************/
// Function to display the menu options and prompt the user to select an option from the available choices
//Calculate the Mean MENU
const handleCalculateMenu = (data) => {
  console.log('\n================================================================================');
  console.log('║------------------------ Calulation of MEAN Menu ----------------------------- ║');
  console.log('================================================================================');
  console.log('║ 1: Calculate the Average rent in every State                                  ║');
  console.log('║ 2: Calculate the Average rent per BHK Category                                ║');
  console.log('║ 3: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  rl.question('Choose an option: ', (choice) => {
    switch(choice) {
        case '1':
          const averageRentByCity = calculateAverageRentByCity(data);
          console.log("Average Rent by City:");
          console.table(averageRentByCity); // Display in table format
          handleCalculateMenu(data); // Prompt the user again after showing the result
          break;

        case '2':
            const averageRentPerBHKCategory = calculateAverageRentPerBHKCategory(houseRentArray);
            console.log('Average Rent per BHK Category:');
            console.table(averageRentPerBHKCategory);
            handleCalculateMenu(data);
            break;

        case '3':
              mainMenu(data);
              break;
          default:
              console.log('Invalid choice, please try again.');
              handleCalculateMenu(data);
      }
  });
};



const handleSearchMenu = (data) => {
console.log('\n================================================================================');
console.log('║------------------- House Rental Information SEARCH Menu --------------------- ║');
console.log('================================================================================');
console.log('║ 1: Apply Incremental Rent Increase and Display                                ║');
console.log('║ 2: Filter by BHK and City                                                     ║');
console.log('║ 3: Filter by Rent Range and Furnishing Status                                 ║');
console.log('║ 4: Advanced Search                                                            ║');
console.log('║ 5: Find Maximum Rent for BHK Category                                         ║');
console.log('║ 6: Find the number of listings in each State                                  ║');
console.log('║ 7: Find the listings with Maximum Size                                        ║');
console.log('║ 8: Filter Listings by City and Pick Certain Properties                        ║');
console.log('║ 9: Return to Main Menu                                                        ║');
console.log('=================================================================================');
  rl.question('Choose an option: ', (choice) => {
      switch(choice) {
          case '1':
              rl.question('Enter the percentage increase for rent: ', (percentage) => {
                  const percentageIncrease = parseFloat(percentage);
                  if (!isNaN(percentageIncrease)) {
                      const updatedRentals = applyIncrementalRentIncrease(percentageIncrease)(data);
                      displayPaginatedTable(updatedRentals); // Display within the user action response
                  } else {
                      console.log('Invalid input, please enter a valid number.');
                      handleSearchMenu(data);
                  }
              });
              break;
          case '2':
            rl.question('Enter BHK (e.g., 2 for 2BHK): ', (bhk) => {
              rl.question('Enter City name: ', (city) => {
                  const bhkInt = parseInt(bhk);
                  if (!isNaN(bhkInt)) {
                      const filteredRentals = filterByBHKAndCity(bhkInt)(city.toLowerCase())(data);
                      displayPaginatedTable(filteredRentals);
                  } else {
                      console.log('Invalid BHK value. Please enter a number.');
                      handleSearchMenu(data);
                  }
                });
            });
            break;
          case '3':
            rl.question('Enter minimum rent: ', (minRent) => {
              rl.question('Enter maximum rent: ', (maxRent) => {
                  rl.question('Enter furnishing status (Furnished, Semi-Furnished, Unfurnished): ', (furnishingStatus) => {
                      const minRentInt = parseInt(minRent);
                      const maxRentInt = parseInt(maxRent);
                      if (!isNaN(minRentInt) && !isNaN(maxRentInt) && furnishingStatus) {
                          const filteredRentals = filterByRentRangeAndFurnishing(minRentInt, maxRentInt)(furnishingStatus)(data);
                          displayPaginatedTable(filteredRentals);
                      } else {
                          console.log('Invalid inputs. Please enter valid numbers for rent and a valid furnishing status.');
                          handleSearchMenu(data);
                      }
                  });
              });
          });
          break;
          case '4':
            rl.question('Enter BHK (leave blank if not applicable): ', (bhk) => {
              rl.question('Enter City (leave blank if not applicable): ', (city) => {
                  rl.question('Enter Maximum Rent (leave blank if not applicable): ', (maxRent) => {
                      const searchParams = {
                          bhk: bhk ? parseInt(bhk) : undefined,
                          city: city ? city : undefined,
                          maxRent: maxRent ? parseInt(maxRent) : undefined
                      };
                      const filteredRentals = advancedSearch(searchParams)(data);
                      displayPaginatedTable(filteredRentals);
                  });
              });
          });
          break;
          case '5':
            rl.question('Enter BHK category (e.g., 2 for 2BHK): ', (inputBHK) => {
              const bhkCategory = parseInt(inputBHK);
              if (!isNaN(bhkCategory)) {
                  const result = findMaxRentForBHK(data, bhkCategory);
                  console.log(`Results for ${bhkCategory}BHK category:`);
                  console.table(result); // Display the max rent in a table format
              } else {
                  console.log('Invalid BHK value. Please enter a number.');
              }
              handleSearchMenu(data); // Prompt the user again after showing the result
          });
          break;

          case '6':
            const counts = countListingsByCity(data);
                const countsTable = Object.entries(counts).map(([city, count]) => ({
                    City: city.charAt(0).toUpperCase() + city.slice(1), // Capitalize the city name
                    Listings: count
                }));
                console.table(countsTable);
                handleSearchMenu(data); // Prompt the user again after showing the result
                break;


          case '7':
            const listingWithMaxSize = findListingWithMaximumSize(houseRentArray);
            if (listingWithMaxSize) {
              console.log('Listing with the Maximum Size:');
              console.table([listingWithMaxSize]); // Display in table format
            } else {
              console.log('No listings with a valid size found.');
              }
              handleSearchMenu(data);
            break;

          case '8':
            rl.question('Enter the city name: ', (cityInput) => {
              const propertiesToPick = ['Posted_On', 'Rent', 'Size']; // Specify the properties you want to pick
              const filteredAndPickedListings = filterAndPickPropertiesByCity(cityInput, propertiesToPick)(data);
              console.log(`Listings for city: ${cityInput}`);
              console.table(filteredAndPickedListings); // Display in table format
              handleSearchMenu(data); // Prompt the user again after showing the result
            });
            break;


          case '9':
              mainMenu(data);
              break;
          default:
              console.log('Invalid choice, please try again.');
              handleSearchMenu(data);
      }
  });
};



// Filter Menu Handler
const handleFilterMenu = (data) => {
  console.log('\n================================================================================');
  console.log('║------------------ House Rental Information FILTER MENU ---------------------- ║');
  console.log('================================================================================');
  console.log('║ 1: Filter by City                                                             ║');
  console.log('║ 2: Filter by Rent Range                                                       ║');
  console.log('║ 3: Filter by BHK                                                              ║');
  console.log('║ 4: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  rl.question('Choose an option: ', (choice) => {
    switch(choice) {
      case '1':
        rl.question('Enter city name: ', (city) => {
          const filteredData = filterRentalsByCity(data, city);
          displayPaginatedTable(filteredData);
        });
        break;
      case '2':
        rl.question('Enter min rent: ', (minRent) => {
          rl.question('Enter max rent: ', (maxRent) => {
            const filteredData = filterRentalsByRentRange(data, parseInt(minRent), parseInt(maxRent));
            displayPaginatedTable(filteredData);
          });
        });
        break;
      case '3':
        rl.question('Enter BHK (e.g., 2 for 2BHK): ', (bhk) => {
          const filteredData = filterRentalsByBHK(data, parseInt(bhk));
          displayPaginatedTable(filteredData);
        });
        break;
      case '4':
        mainMenu(data);
        break;
      default:
        console.log('Invalid choice, please try again.');
        handleFilterMenu(data);
    }
  });
};




// Sorting Menu Handler
const handleSortMenu = (data) => { 
  console.log('\n================================================================================');
  console.log('║-------------------House Rental Information SORT MENU ------------------------ ║');
  console.log('================================================================================');
  console.log('║ 1: Sort by Rent (Ascending)                                                   ║');
  console.log('║ 2: Sort by Rent (Descending)                                                  ║');
  console.log('║ 3: Sort by BHK (Ascending)                                                    ║');
  console.log('║ 4: Sort by BHK (Decending)                                                    ║');
  console.log('║ 5: Sort by House Size (Ascending)                                             ║');
  console.log('║ 6: Sort by House Size (Decending)                                             ║');
  console.log('║ 7: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  rl.question('Choose an option: ', (choice) => {
    switch(choice) {
      case '1':
        sortedData = sortByRentAscending(data);
        break;
      case '2':
        sortedData = sortByRentDescending(data);
        break;
      case '3':
        sortedData = sortByBHKAscending(data);
        break;
      case '4':
        sortedData = sortByBHKDescending(data);
        break;
      case '5':
        sortedData = sortBySizeAscending(data);
        break;
      case '6':
        sortedData = sortBySizeDescending(data);
        break;
      case '7':
        mainMenu(data);
        return;
      default:
        console.log('Invalid choice, please try again.');
        handleSortMenu(data);
        return; // Add return to prevent the code from falling through
    }
    displayPaginatedTable(sortedData); // Display the sorted data
  });
};

// Main Menu
const mainMenu = (data) => {
  console.log('\n==================== Welcome to House Rentals in India !==========================');
  console.log('\n=================================================================================');
  console.log('║-------------------House Rental Information in India 2022 DATA ---------------- ║');
  console.log('=================================================================================');
  console.log('║ 1. Display all the data                                                        ║');
  console.log('║ 2. Sort on specific field of house rentals in India 2022                       ║');
  console.log('║ 3. Filter Data                                                                 ║');
  console.log('║ 4. Search and Upadate Data                                                     ║');
  console.log('║ 5. Calculate the Mean                                                          ║');
  console.log('║ 0. Exit                                                                        ║');
  console.log('==================================================================================');
  rl.question('Choose an option: ', (choice) => {
    switch(choice) {
      case '1':
        displayCleanTable(houseRentArray);
        break;
      case '2':
        handleSortMenu(data);
        break;
      case '3':
        handleFilterMenu(data);
        break;
      case '4':
        handleSearchMenu(data);
        break;
      case '5':
        handleCalculateMenu(data);
        break;
      case '0':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid choice, please try again.');
        mainMenu(data);
    }
  });
};

// Start the application
if (houseRentArray.length === 0) {
  console.log("Array is empty");
} else {
  mainMenu(houseRentArray); // Ensuring this is the entry point of the script
}
