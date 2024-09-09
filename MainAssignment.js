// APLC Assignment - Main Script


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
  const pageSize = 30;  // Set the number of items per page
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



/************************************************************* SORTING FUNCTIONS *******************************************************/



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



//Function to sort rentals in a specific city 
const filterByCity = (city) => (rentals) =>
  rentals.filter(rental => rental.City.trim().toLowerCase() === city.toLowerCase());

const sortByRent = (ascending = true) => (rentals) =>
  rentals.sort((a, b) => ascending ? a.Rent - b.Rent : b.Rent - a.Rent);


// Function to group rentals by BHK
const groupByBHK = (rentals) =>
  rentals.reduce((acc, rental) => {
    const bhk = rental.BHK;
    return {
      ...acc,
      [bhk]: [...(acc[bhk] || []), rental]
    };
  }, {});

// Function to pick specific properties from each rental
const pickProperties = (rental) => ({
  Rented_On: rental.Posted_On, // Assuming 'Rented_On' is same as 'Posted_On'
  Size: rental.Size,
  BHK: rental.BHK,
  City: rental.City
});

// Function to sort each group by size and pick specific properties
const sortEachGroupBySize = (groups) =>
  Object.entries(groups).reduce((acc, [key, rentals]) => ({
    ...acc,
    [key]: rentals
             .slice()
             .sort((a, b) => a.Size - b.Size)
             .map(pickProperties)
  }), {});





/************************************************************* FILTER FUNCTIONS *******************************************************/


// Filter Rentals by City (Pure Function)
const filterRentalsByCity = (data, city) => 
  data.filter(item => item.City.toLowerCase() === city.toLowerCase());

// Filter Rentals by Rent Range (Pure Function)
const filterRentalsByRentRange = (data, minRent, maxRent) => 
  data.filter(item => item.Rent >= minRent && item.Rent <= maxRent);

// Filter Rentals by BHK (Pure Function)
const filterRentalsByBHK = (data, bhk) => 
  data.filter(item => parseInt(item.BHK) === bhk);



/************************************************************* CURRIED FUNCTIONS ******************************************************/

// Function for Incremental Increase Rental Checking 
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
  if (index === data.length) {
      return counts;
  }
  if (Array.isArray(data[index])) {
      counts = countListingsByCity(data[index], counts);
  } else {
      const city = data[index].City.trim().toLowerCase();
      counts[city] = (counts[city] || 0) + 1;
  }
  
  return countListingsByCity(data, counts, index + 1);
}




/************************************************************* REDUCE FUNCTIONS ***************************************************/


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
    
    const bhkValue = parseInt(BHK);
    const rentValue = parseFloat(Rent);

    if (!isNaN(bhkValue) && !isNaN(rentValue)) {
      if (!acc[bhkValue]) {
        acc[bhkValue] = { totalRent: 0, count: 0 };
      }
      acc[bhkValue].totalRent += rentValue;
      acc[bhkValue].count += 1;
    } else {
      
      console.warn(`Skipping invalid BHK or Rent value. BHK: ${BHK}, Rent: ${Rent}`);
    }

    return acc;
  }, {});

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
    if (listing.Size && !isNaN(listing.Size)) {
      const sizeValue = parseFloat(listing.Size); 
      if (acc === null || sizeValue > acc.Size) {
        return listing; 
      }
    } else {
      
      console.warn(`Invalid size for listing: ${JSON.stringify(listing)}`);
    }
    return acc; 
  }, null); 

  return maxListing; 
};

const compose = (...fns) => (x) =>
  fns.reduceRight((v, f) => f(v), x);

const filterAndPickPropertiesByCity = (city, props) => compose(
  pickProperties(props),
  filterByCity(city)
);



// Recursive function - The top 3 cities with the most rentals 
function countRentalsByCity(rentals, index = 0, counts = {}) {
  if (index === rentals.length) {
    return counts;
  }

  const city = rentals[index].City.trim().toLowerCase();
  return countRentalsByCity(rentals, index + 1, {
    ...counts,
    [city]: (counts[city] || 0) + 1
  }); 
}

function topThreeCitiesWithMostRentals(rentals) {
  const counts = countRentalsByCity(rentals);
  const sortedCounts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return sortedCounts.map(([city, count]) => ({ City: city, Count: count }));
}



// Recursive function - Percentage of each Furnishing Type in each city 
function groupRentalsByCity(rentals, index = 0, grouped = {}) {
  if (index >= rentals.length) {
    return grouped; 
  }
  const rental = rentals[index];
  const city = rental.City.trim().toLowerCase();
  const furnishingType = rental.Furnishing_Status.trim().toLowerCase();

  return groupRentalsByCity(rentals, index + 1, {
    ...grouped,
    [city]: {
      ...grouped[city],
      total: (grouped[city]?.total || 0) + 1,
      [furnishingType]: (grouped[city]?.[furnishingType] || 0) + 1
    }
  });
}

function calculatePercentages(groupedData) {
  return Object.entries(groupedData).reduce((acc, [city, data]) => ({
    ...acc,
    [city]: Object.entries(data).reduce((innerAcc, [key, value]) => {
      if (key !== 'total') {
        innerAcc[key] = ((value / data.total) * 100).toFixed(2) + '%';
      }
      return innerAcc;
    }, {})
  }), {});
}








/************************************************************* Menus *****************************************************************/
// Function to display the menu options and prompt the user to select an option from the available choices
//Calculate the Mean MENU
const handleCalculateMenu = (data) => {
  console.log('\n================================================================================');
  console.log('║----------------------------- REPORTS Menu ----------------------------------- ║');
  console.log('================================================================================');
  console.log('║ 1: The Average rent in every State                                            ║');
  console.log('║ 2: The Average rent per BHK Category                                          ║');
  console.log('║ 3: The top 3 cities with the most rentals                                     ║');
  console.log('║ 4: The Maximum Rent for BHK Category                                          ║');
  console.log('║ 5: The number of listings in each State                                       ║');
  console.log('║ 6: The listings with Maximum Size                                             ║');
  console.log('║ 7: Percentage of each Furnishing Type in each city                            ║');
  console.log('║ 8: Return to Main Menu                                                        ║');
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
          const topCities = topThreeCitiesWithMostRentals(data);
          console.log('Top 3 Cities with the Most Rentals:');
          console.table(topCities);
          handleCalculateMenu(data); // Re-prompt the search menu
          break;

        case '4':
            rl.question('Enter BHK category (e.g., 2 for 2BHK): ', (inputBHK) => {
              const bhkCategory = parseInt(inputBHK);
              if (!isNaN(bhkCategory)) {
                  const result = findMaxRentForBHK(data, bhkCategory);
                  console.log(`Results for ${bhkCategory}BHK category:`);
                  console.table(result); // Display the max rent in a table format
              } else {
                  console.log('Invalid BHK value. Please enter a number.');
              }
              handleCalculateMenu(data); // Prompt the user again after showing the result
          });
          break;

          case '5':
            const counts = countListingsByCity(data);
                const countsTable = Object.entries(counts).map(([city, count]) => ({
                    City: city.charAt(0).toUpperCase() + city.slice(1), // Capitalize the city name
                    Listings: count
                }));
                console.table(countsTable);
                handleCalculateMenu(data); // Prompt the user again after showing the result
                break;


          case '6':
            const listingWithMaxSize = findListingWithMaximumSize(houseRentArray);
            if (listingWithMaxSize) {
              console.log('Listing with the Maximum Size:');
              console.table([listingWithMaxSize]); // Display in table format
            } else {
              console.log('No listings with a valid size found.');
              }
              handleCalculateMenu(data);
            break;

          case'7':
          const furnishingPercentages = calculatePercentages(groupRentalsByCity(data));
          console.log('Percentage of Each Furnishing Type in Each City:');
          Object.entries(furnishingPercentages).forEach(([city, percentages]) => {
            console.log(`City: ${city.charAt(0).toUpperCase() + city.slice(1)}`);
            console.table(percentages);
          });
          handleCalculateMenu(data); // Re-prompt the calculation menu
          break;


        case '8':
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
console.log('║----------------- House Rental Information MISCELLANEOUS Menu------------------ ║');
console.log('================================================================================');
console.log('║ 1: Apply Incremental Rent Increase and Display                                ║');
console.log('║ 2: Filter by BHK and City                                                     ║');
console.log('║ 3: Filter by Rent Range and Furnishing Status                                 ║');
console.log('║ 4: Advanced Search                                                            ║');
console.log('║ 5: Return to Main Menu                                                        ║');
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




const handleSortMenu = (data) => { 
  console.log('\n================================================================================');
  console.log('║-------------------House Rental Information SORT MENU ------------------------ ║');
  console.log('================================================================================');
  console.log('║ 1: Sort by Rent (Ascending)                                                   ║');
  console.log('║ 2: Sort by Rent (Descending)                                                  ║');
  console.log('║ 3: Sort by Rent in a Specific City                                            ║');
  console.log('║ 4: Sort Rentals group by BHK and then Size (Ascending)                        ║');
  console.log('║ 5: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  rl.question('Choose an option: ', (choice) => {
    let sortedData;
    switch(choice) {
      case '1':
        sortedData = sortByRentAscending(data);
        displayPaginatedTable(sortedData);
        break;
      case '2':
        sortedData = sortByRentDescending(data);
        displayPaginatedTable(sortedData);
        break;
      case '3':
        rl.question('Enter city name: ', (city) => {
          sortedData = sortByRent(true)(filterByCity(city)(data));
          displayPaginatedTable(sortedData);
          handleSortMenu(data);
        });
        break;
      case '4':
        const groupedRentals = groupByBHK(data);
        const sortedGroupsBySize = sortEachGroupBySize(groupedRentals);
        console.log('Rentals Grouped by BHK and Sorted by Size:');
        Object.entries(sortedGroupsBySize).forEach(([bhk, rentals]) => {
          console.log(`BHK: ${bhk}`);
          displayPaginatedTable(rentals);
        });
        handleSortMenu(data);
      case '5':
        mainMenu(data);
        break;
      default:
        console.log('Invalid choice, please try again.');
        handleSortMenu(data);
    }
  });
};


// Main Menu
const mainMenu = (data) => {
  console.log('\n==================== Welcome to House Rentals in India !==========================');
  console.log('\n=================================================================================');
  console.log('║-------------------House Rental Information in India 2022 DATA ---------------- ║');
  console.log('=================================================================================');
  console.log('║ 1. Display dataset                                                             ║');
  console.log('║ 2. Sort on specific field Menu                                                 ║');
  console.log('║ 3. Filter Rentals Menu                                                         ║');
  console.log('║ 4. Reports Menu                                                                ║');
  console.log('║ 5. Miscelleneous Menu                                                          ║');
  console.log('║ 0. Exit                                                                        ║');
  console.log('==================================================================================');
  rl.question('Choose a Menu option: ', (choice) => {
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
        handleCalculateMenu(data);
        break;
      case '5':
        handleSearchMenu(data);
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


const mainMainMenu = (data) => {
  console.log('\n==================== Welcome to House Rentals in India !==========================');
  console.log('\n=================================================================================');
  console.log('║-------------------House Rental Information in India 2022 DATA ---------------- ║');
  console.log('=================================================================================');
  console.log('║ 1. FUNCTIONAL SCRIPT                                                           ║');
  console.log('║ 2. IMPERATIVE SCRIPT                                                           ║');
  console.log('║ 0. Exit                                                                        ║');
  console.log('==================================================================================');
  rl.question('Choose an option: ', (choice) => {
    switch(choice) {
      case '1':
        mainMenu(data);
        break;
      case '2':
        mainMenu1(data);
        break;
      case '0':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid choice, please try again.');
        mainMainMenu(data);
    }
  });
};



/******************************************************* IMPERATIVE SCRIPT ******************************************************/
/******************************************************* IMPERATIVE SCRIPT ******************************************************/
/******************************************************* IMPERATIVE SCRIPT ******************************************************/
/******************************************************* IMPERATIVE SCRIPT ******************************************************/
/******************************************************* IMPERATIVE SCRIPT ******************************************************/

// Function to display data with pagination (imperative version)
function displayPaginatedTable1(data, currentPage = 1) {
  const pageSize = 25;
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  const paginatedData = [];
  for (let i = startIndex; i < endIndex; i++) {
    paginatedData.push(data[i]);
  }

  console.table(paginatedData);
  console.log(`Page ${currentPage} of ${totalPages}`);

  rl.question('Next page (n), Previous page (p), Main menu (m): ', choice => {
    if (choice === 'n' && currentPage < totalPages) {
      displayPaginatedTable1(data, currentPage + 1);
    } else if (choice === 'p' && currentPage > 1) {
      displayPaginatedTable1(data, currentPage - 1);
    } else if (choice === 'm') {
      mainMenu1(houseRentArray); // Go back to main menu
    } else {
      console.log('Invalid choice.');
      displayPaginatedTable1(data, currentPage); // Repeat the current page
    }
  });
}


function displayCleanTable1(data) {
  if (data && Array.isArray(data) && data.length > 0) {
    const truncatedData = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const truncatedAreaLocality = truncateString(item.Area_Locality, 20);
      const truncatedPointOfContact = truncateString(item.Point_of_Contact, 20);
      truncatedData.push({ ...item, Area_Locality: truncatedAreaLocality, Point_of_Contact: truncatedPointOfContact });
    }
    displayPaginatedTable1(truncatedData); // Start with first page
  } else {
    console.log('No data to display');
  }
}

/******************************************************* MENUS ******************************************************/


//MAIN MENU IMP
function mainMenu1(data) {
  console.log('\n================== Welcome to House Rentals in India ! IMP ======================');
  console.log('\n=================================================================================');
  console.log('║-------------------House Rental Information in India 2022 DATA ---------------- ║');
  console.log('=================================================================================');
  console.log('║ 1. Display all the data                                                        ║');
  console.log('║ 2. Sort on specific field Menu                                                 ║');
  console.log('║ 3. Filter Rent Menu                                                            ║');
  console.log('║ 4. Reports/Search Menu                                                         ║');
  console.log('║ 5. Miscelleneous Menu                                                          ║');
  console.log('║ 0. Exit                                                                        ║');
  console.log('==================================================================================');

  rl.question('Choose a Menu Option: ', (choice) => {
      switch(choice) {
          case '1':
              displayCleanTable1(data);
              break;
          case '2': 
              handleSortMenu1(data);
              break;
          case '3':
            handleFilterMenu1(data);
            break;
          case '4':
            handleCalculateMenu1(data);
            break;
          
          case '5':
            handleSearchMenu1(data);
            break;
          case '0':
              console.log('Exiting...');
              rl.close();
              return;
          default:
              console.log('Invalid choice, please try again.');
              mainMenu1(data);
      }
  });
}


function handleSortMenu1(data) {
  console.log('\n================================================================================');
  console.log('║------------------House Rental Information SORT MENU IMP---------------------- ║');
  console.log('================================================================================');
  console.log('║ 1: Sort by Rent (Ascending)                                                   ║');
  console.log('║ 2: Sort by Rent (Descending)                                                  ║');
  console.log('║ 3: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  
  rl.question('Choose an option: ', function(choice) {
    var sortedData;
    if (choice === '1') {
      // Assuming sortByRentAscending is a function similar to sortByRentDescending
      sortedData = sortByRentAscending1(data);
    } else if (choice === '2') {
      sortedData = sortByRentDescending1(data);
    } else if (choice === '3') {
      mainMenu1(data);
      return;
    } else {
      console.log('Invalid choice, please try again.');
      handleSortMenu1(data);
      return;
    }

    displayPaginatedTable1(sortedData); // Display the sorted data
  });
}


function handleFilterMenu1(data) {
  console.log('\n================================================================================');
  console.log('║----------------House Rental Information FILTER MENU IMP --------------------- ║');
  console.log('================================================================================');
  console.log('║ 1: Filter by City                                                             ║');
  console.log('║ 2: Filter by BHK                                                              ║');
  console.log('║ 3: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  
  rl.question('Choose an option: ', function(choice) {
    if (choice === '1') {
      rl.question('Enter city name: ', function(city) {
        var filteredData = filterRentalsByCity1(data, city);
        displayPaginatedTable1(filteredData);
      });
    }  else if (choice === '2') {
      rl.question('Enter BHK (e.g., 2 for 2BHK): ', function(bhk) {
        var filteredData = filterRentalsByBHK1(data, parseInt(bhk));
        displayPaginatedTable1(filteredData);
      });
    } else if (choice === '3') {
      mainMenu1(data);
    } else {
      console.log('Invalid choice, please try again.');
      handleFilterMenu1(data);
    }
  });
}



function handleCalculateMenu1(data) {
    console.log('\n================================================================================');
    console.log('║------------------------REPORTS Menu IMP-------------------------------------- ║');
    console.log('================================================================================');
    console.log('║ 1: Calculate the Average rent in every City                                   ║');
    console.log('║ 2: Calculate the Average rent in per bhk category                             ║');
    console.log('║ 3: Find listing with the maximum size                                         ║');
    console.log('║ 4: Find Maximum Rent for BHK Category                                         ║');
    console.log('║ 5: Find the number of listings in each State                                  ║');
    console.log('║ 6: Return to Main Menu                                                        ║');
    console.log('=================================================================================');
    rl.question('Choose an option: ', (choice) => {
      if (choice === '1') {
        var averageRentByCity = calculateAverageRentByCity1(data);
        console.log("Average Rent by City:");
        console.table(averageRentByCity); // Display in table format
        handleCalculateMenu1(data); // Prompt the user again after showing the result
      } else if (choice === '2') {
        var averageRentPerBHKCategory = calculateAverageRentPerBHKCategory1(data);
        console.log("Average Rent per BHK Category:");
        console.table(averageRentPerBHKCategory); // Display in table format
        handleCalculateMenu1(data); // Prompt the user again after showing the result
        } else if (choice === '3') {
          var maxListing = findListingWithMaximumSizeImperative(data);
          console.log("Listing with the Maximum Size:");
          console.table(maxListing);
          handleCalculateMenu1(data);
          } else if (choice === '4') {
            rl.question('Enter BHK category (e.g., 2 for 2BHK): ', (inputBHK) => {
              const bhkCategory = parseInt(inputBHK);
              if (!isNaN(bhkCategory)) {
                const maxRent = findMaxRentForBHK1(data, bhkCategory);
                console.log(`Maximum Rent for ${bhkCategory}BHK category: ${maxRent}`);
                handleCalculateMenu1(data); // Corrected from handleSearchMenu1 to handleCalculateMenu1
              } else {
                console.log('Invalid BHK value. Please enter a number.');
                handleCalculateMenu1(data);}
            });
          } else if (choice === "5"){
            const counts = countListingsByCity1(data);
            const countsTable = [];
            for (var city in counts) {
              if (counts.hasOwnProperty(city)) {
              countsTable.push({
              City: city.charAt(0).toUpperCase() + city.slice(1),
              Listings: counts[city]
            });
        }
      }
      console.table(countsTable);
      handleCalculateMenu1(data);
      } else if (choice === '6') {
        mainMenu1(data);
      } else {
        console.log('Invalid choice, please try again.');
        handleCalculateMenu1(data);
      }
    });
  };


  const handleSearchMenu1 = (data) => {
    console.log('\n================================================================================');
    console.log('║--------------------------- MISCELLENEOUS Menu IMP --------------------------- ║');
    console.log('================================================================================');
    console.log('║ 1: Apply Incremental Rent Increase and Display                                ║');
    console.log('║ 2: Filter by BHK and City                                                     ║');
    console.log('║ 3: Return to Main Menu                                                        ║');
    console.log('=================================================================================');
    rl.question('Choose an option: ', (choice) => {
      switch(choice) {
        case '1':
          rl.question('Enter the percentage increase for rent: ', (percentage) => {
            const percentageIncrease = parseFloat(percentage);
            if (!isNaN(percentageIncrease)) {
              // Imperative version of applyIncrementalRentIncrease should be used here
              const updatedRentals = applyIncrementalRentIncrease1(percentageIncrease)(data);
              displayPaginatedTable1(updatedRentals);
            } else {
              console.log('Invalid input, please enter a valid number.');
              handleSearchMenu1(data);
            }
          });
          break;
        case '2':
          rl.question('Enter BHK (e.g., 2 for 2BHK): ', (bhk) => {
            rl.question('Enter City name: ', (city) => {
              const bhkInt = parseInt(bhk);
              if (!isNaN(bhkInt)) {
                const filteredRentals = filterByBHKAndCity1(data, bhkInt, city);
                displayPaginatedTable1(filteredRentals);
              } else {
                console.log('Invalid BHK value. Please enter a number.');
                handleSearchMenu1(data);
              }
            });
          });
          break;
       
        case '3':
          mainMenu1(data);
          break;
        default:
          console.log('Invalid choice, please try again.');
          handleSearchMenu1(data);
      }
    });
  };
  
  


/*******************************************************SORTING FUNCTIONS IMP() ******************************************************/

//Function to sort Rent by ascending order IMP
function sortByRentDescending1(data) {
  var newData = [];
  for (var i = 0; i < data.length; i++) {
      newData.push({
          Rented_On: data[i].Rented_On || data[i].Posted_On, 
          BHK: data[i].BHK,
          Rent: parseInt(data[i].Rent), 
          City: data[i].City
      });
  }
// Manual sorting in Descending order
  for (var i = 0; i < newData.length - 1; i++) {
      for (var j = i + 1; j < newData.length; j++) {
          if (newData[i].Rent < newData[j].Rent) {
              var temp = newData[i];
              newData[i] = newData[j];
              newData[j] = temp;
          }
      }
  }

  return newData;
}

//Function to sort Rent by ascending order IMP
function sortByRentAscending1(data) {
  var newData = [];
  for (var i = 0; i < data.length; i++) {
      var item = {
          Rented_On: data[i].Posted_On,
          BHK: data[i].BHK,
          Rent: parseInt(data[i].Rent, 10), 
          City: data[i].City
      };
      newData.push(item);
  }

  // Manual sorting in ascending order
  for (var i = 0; i < newData.length - 1; i++) {
      for (var j = i + 1; j < newData.length; j++) {
          if (newData[i].Rent > newData[j].Rent) {
              var temp = newData[i];
              newData[i] = newData[j];
              newData[j] = temp;
          }
      }
  }

  return newData;
}







/*****************************************************FILTER FUNCTIONS IMP()*****************************************************/

//Function to filter rentals by  city IMP
function filterRentalsByCity1(data, city) {
  var filteredData = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].City.toLowerCase() === city.toLowerCase()) {
      filteredData.push(data[i]);
    }
  }
  return filteredData;
}


//Function to filter rentals by  BHK IMP
function filterRentalsByBHK1(data, bhk) {
  var filteredData = [];
  for (var i = 0; i < data.length; i++) {
    if (parseInt(data[i].BHK) === bhk) {
      filteredData.push(data[i]);
    }
  }
  return filteredData;
}



/*****************************************************REDUCE FUNCTIONS IMP()*****************************************************/

function calculateAverageRentByCity1(rentalData) {
  var totalsByCity = {};
  var averageRents = [];
  
  // Filtering valid rentals and calculating total rent and count for each city
  for (var i = 0; i < rentalData.length; i++) {
    var rent = parseFloat(rentalData[i].Rent);
    if (!isNaN(rent)) {
      var city = rentalData[i].City.trim().toLowerCase();
      if (!totalsByCity[city]) {
        totalsByCity[city] = { totalRent: 0, count: 0 };
      }
      totalsByCity[city].totalRent += rent;
      totalsByCity[city].count += 1;
    }
  }
  
  // Calculating average rent for each city
  for (var city in totalsByCity) {
    if (totalsByCity.hasOwnProperty(city)) {
      var cityData = totalsByCity[city];
      var averageRent = cityData.count > 0 ? (cityData.totalRent / cityData.count).toFixed(2) : 'No data';
      averageRents.push({
        City: city.charAt(0).toUpperCase() + city.slice(1),
        Average_Rent: averageRent
      });
    }
  }

  return averageRents;
}



//calculate the average rent per bhk category 
function calculateAverageRentPerBHKCategory1(rentalData) {
  var totalsPerBHK = {};
  
  for (var i = 0; i < rentalData.length; i++) {
    var rental = rentalData[i];
    var bhkValue = parseInt(rental.BHK);
    var rentValue = parseFloat(rental.Rent);

    if (!isNaN(bhkValue) && !isNaN(rentValue)) {
      if (!totalsPerBHK[bhkValue]) {
        totalsPerBHK[bhkValue] = { totalRent: 0, count: 0 };
      }
      totalsPerBHK[bhkValue].totalRent += rentValue;
      totalsPerBHK[bhkValue].count += 1;
    } else {
      console.warn(`Skipping invalid BHK or Rent value. BHK: ${rental.BHK}, Rent: ${rental.Rent}`);
    }
  }

  var averageRentPerBHK1 = {};
  for (var bhk in totalsPerBHK) {
    if (totalsPerBHK.hasOwnProperty(bhk)) {
      var bhkData = totalsPerBHK[bhk];
      averageRentPerBHK1[bhk] = bhkData.count > 0 ? (bhkData.totalRent / bhkData.count).toFixed(2) : 'No data';
    }
  }

  return averageRentPerBHK1;
}


/*****************************************************CURRIED FUNCTIONS IMP()*****************************************************/

//Function for Incremental Increase Rental Checking 
function applyIncrementalRentIncrease1(percentageIncrease) {
  return function(data) {
    var newData = [];
    for (var i = 0; i < data.length; i++) {
      var rental = data[i];
      var increasedRent = Math.round(rental.Rent + rental.Rent * (percentageIncrease / 100));
      newData.push({
        Rent: increasedRent,
        City: rental.City,
        Posted_On: rental.Posted_On
      });
    }
    return newData;
  }
}

// Function to Filter BHK AND CITY 
function filterByBHKAndCity1(bhk) {
  return function(city) {
    return function(data) {
      var filteredData = [];
      for (var i = 0; i < data.length; i++) {
        var rental = data[i];
        var rentalBHK = parseInt(rental.BHK);
        var rentalCity = rental.City.toLowerCase();
        if (rentalBHK === bhk && rentalCity === city.toLowerCase()) {
          filteredData.push(rental);
        }
      }
      return filteredData;
    }
  }
}


/******************************************************* RECURRSIVE FUNCTIONS IMP()***************************************************/

//Function to find the Max rent for each BHK
function findMaxRentForBHK1(rentals, bhk) {
  var maxRent = 0;
  for (var i = 0; i < rentals.length; i++) {
      var currentRental = rentals[i];
      var currentBHK = parseInt(currentRental.BHK);
      var currentRent = currentRental.Rent;

      if (currentBHK === bhk) {
          maxRent = Math.max(maxRent, currentRent);
      }
  }
  return maxRent;
}

//Function to calculate the number of listings in each state
function countListingsByCity1(data) {
  var counts = {};

  for (var i = 0; i < data.length; i++) {
      // Check if the current item is an array (nested structure)
      if (Array.isArray(data[i])) {
          // Process each element of the nested array
          for (var j = 0; j < data[i].length; j++) {
              var city = data[i][j].City.trim().toLowerCase();
              counts[city] = (counts[city] || 0) + 1;
          }
      } else {
          // Process a non-nested item
          var city = data[i].City.trim().toLowerCase();
          counts[city] = (counts[city] || 0) + 1;
      }
  }
  return counts;
}


function findListingWithMaximumSizeImperative(rentalData) {
  var maxListing = null;
  var maxSize = 0;

  for (var i = 0; i < rentalData.length; i++) {
    var listing = rentalData[i];
    if (listing.Size && !isNaN(listing.Size)) {
      var sizeValue = parseFloat(listing.Size);
      if (maxListing === null || sizeValue > maxSize) {
        maxListing = listing;
        maxSize = sizeValue;
      }
    } else {
      console.warn(`Invalid size for listing: ${JSON.stringify(listing)}`);
    }
  }

  return maxListing;
}




// Start the application
if (houseRentArray.length === 0) {
  console.log("Array is empty");
} else {
  mainMainMenu(houseRentArray); // Ensuring this is the entry point of the script
}
