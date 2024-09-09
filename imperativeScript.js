//Imperative Script

const fs = require('fs');
const readline = require('readline');

// Read and parse the JSON data from the file
function readJsonFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

const houseRentArray = readJsonFile('House_Rent_Dataset.json');

// Create an interface for reading from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to truncate string to a fixed length (imperative version)
function truncateString(str, num) {
  let truncated = '';
  for (let i = 0; i < num && i < str.length; i++) {
    truncated += str[i];
  }
  return truncated + (str.length > num ? '...' : '');
}

// Function to display data with pagination (imperative version)
function displayPaginatedTable(data, currentPage = 1) {
  const pageSize = 500;
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
      displayPaginatedTable(data, currentPage + 1);
    } else if (choice === 'p' && currentPage > 1) {
      displayPaginatedTable(data, currentPage - 1);
    } else if (choice === 'm') {
      mainMenu1(houseRentArray); // Go back to main menu
    } else {
      console.log('Invalid choice.');
      displayPaginatedTable(data, currentPage); // Repeat the current page
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
    displayPaginatedTable(truncatedData); // Start with first page
  } else {
    console.log('No data to display');
  }
}


function mainMenu1(data) {
  console.log('\n==================== Welcome to House Rentals in India !==========================');
  console.log('\n=================================================================================');
  console.log('║-------------------House Rental Information in India 2022 DATA ---------------- ║');
  console.log('=================================================================================');
  console.log('║ 1. Display all the data                                                        ║');
  console.log('║ 2. Sort on specific field of house rentals in India 2022                       ║');
  console.log('║ 3. Filter Data                                                                 ║');
  console.log('║ 4. Search and Update Data                                                      ║');
  console.log('║ 5. Calculate the Mean                                                          ║');
  console.log('║ 0. Exit                                                                        ║');
  console.log('==================================================================================');

  rl.question('Choose an option: ', (choice) => {
      switch(choice) {
          case '1':
              displayCleanTable1(data);
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

          // Add cases for 3, 4, 5 as per your existing functionality
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


function handleSortMenu(data) {
  console.log('\n================================================================================');
  console.log('║-------------------House Rental Information SORT MENU ------------------------ ║');
  console.log('================================================================================');
  console.log('║ 1: Sort by Rent (Ascending)                                                   ║');
  console.log('║ 2: Sort by Rent (Descending)                                                  ║');
  console.log('║ 3: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  
  rl.question('Choose an option: ', function(choice) {
    var sortedData;
    if (choice === '1') {
      // Assuming sortByRentAscending is a function similar to sortByRentDescending
      sortedData = sortByRentAscending(data);
    } else if (choice === '2') {
      sortedData = sortByRentDescending(data);
    } else if (choice === '3') {
      mainMenu1(data);
      return;
    } else {
      console.log('Invalid choice, please try again.');
      handleSortMenu(data);
      return;
    }

    displayPaginatedTable(sortedData); // Display the sorted data
  });
}


function handleFilterMenu(data) {
  console.log('\n================================================================================');
  console.log('║------------------ House Rental Information FILTER MENU ---------------------- ║');
  console.log('================================================================================');
  console.log('║ 1: Filter by City                                                             ║');
  console.log('║ 2: Filter by BHK                                                              ║');
  console.log('║ 3: Return to Main Menu                                                        ║');
  console.log('=================================================================================');
  
  rl.question('Choose an option: ', function(choice) {
    if (choice === '1') {
      rl.question('Enter city name: ', function(city) {
        var filteredData = filterRentalsByCity(data, city);
        displayPaginatedTable(filteredData);
      });
    }  else if (choice === '2') {
      rl.question('Enter BHK (e.g., 2 for 2BHK): ', function(bhk) {
        var filteredData = filterRentalsByBHK(data, parseInt(bhk));
        displayPaginatedTable(filteredData);
      });
    } else if (choice === '3') {
      mainMenu1(data);
    } else {
      console.log('Invalid choice, please try again.');
      handleFilterMenu(data);
    }
  });
}



function handleCalculateMenu(data) {
    console.log('\n================================================================================');
    console.log('║------------------------ Calculation of MEAN Menu ----------------------------- ║');
    console.log('================================================================================');
    console.log('║ 1: Calculate the Average rent in every City                                   ║');
    console.log('║ 2: Return to Main Menu                                                        ║');
    console.log('=================================================================================');
    rl.question('Choose an option: ', (choice) => {
      if (choice === '1') {
        var averageRentByCity = calculateAverageRentByCity(data);
        console.log("Average Rent by City:");
        console.table(averageRentByCity); // Display in table format
        handleCalculateMenu(); // Prompt the user again after showing the result
      } else if (choice === '2') {
        mainMenu1(data);
      } else {
        console.log('Invalid choice, please try again.');
        handleCalculateMenu();
      }
    });
  };



  const handleSearchMenu = (data) => {
    console.log('\n================================================================================');
    console.log('║------------------- House Rental Information SEARCH Menu --------------------- ║');
    console.log('================================================================================');
    console.log('║ 1: Apply Incremental Rent Increase and Display                                ║');
    console.log('║ 2: Filter by BHK and City                                                     ║');
    console.log('║ 3: Find Maximum Rent for BHK Category                                         ║');
    console.log('║ 4: Find the number of listings in each State                                  ║');
    console.log('║ 5: Return to Main Menu                                                        ║');
    console.log('=================================================================================');
    rl.question('Choose an option: ', (choice) => {
      switch(choice) {
        case '1':
          rl.question('Enter the percentage increase for rent: ', (percentage) => {
            const percentageIncrease = parseFloat(percentage);
            if (!isNaN(percentageIncrease)) {
              // Imperative version of applyIncrementalRentIncrease should be used here
              const updatedRentals = applyIncrementalRentIncrease(percentageIncrease)(data);
              displayPaginatedTable(updatedRentals);
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
                const filteredRentals = filterByBHKAndCity(data, bhkInt, city);
                displayPaginatedTable(filteredRentals);
              } else {
                console.log('Invalid BHK value. Please enter a number.');
                handleSearchMenu(data);
              }
            });
          });
          break;
        case '3':
          rl.question('Enter BHK category (e.g., 2 for 2BHK): ', (inputBHK) => {
            const bhkCategory = parseInt(inputBHK);
            if (!isNaN(bhkCategory)) {
              const maxRent = findMaxRentForBHK(data, bhkCategory);
              console.log(`Maximum Rent for ${bhkCategory}BHK category: ${maxRent}`);
              handleSearchMenu(data);
            } else {
              console.log('Invalid BHK value. Please enter a number.');
              handleSearchMenu(data);
            }
          });
          break;
        case '4':
          const counts = countListingsByCity(data);
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
          handleSearchMenu(data);
          break;
        case '5':
          mainMenu1(data);
          break;
        default:
          console.log('Invalid choice, please try again.');
          handleSearchMenu(data);
      }
    });
  };
  
  


/*******************************************************SORTING FUNCTIONS IMP() ******************************************************/

//Function to sort Rent by ascending order IMP
function sortByRentDescending(data) {
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
function sortByRentAscending(data) {
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
function filterRentalsByCity(data, city) {
  var filteredData = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].City.toLowerCase() === city.toLowerCase()) {
      filteredData.push(data[i]);
    }
  }
  return filteredData;
}


//Function to filter rentals by  BHK IMP
function filterRentalsByBHK(data, bhk) {
  var filteredData = [];
  for (var i = 0; i < data.length; i++) {
    if (parseInt(data[i].BHK) === bhk) {
      filteredData.push(data[i]);
    }
  }
  return filteredData;
}



/*****************************************************REDUCE FUNCTIONS IMP()*****************************************************/

function calculateAverageRentByCity(rentalData) {
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


/*****************************************************CURRIED FUNCTIONS IMP()*****************************************************/

//Function for Incremental Increase Rental Checking 
function applyIncrementalRentIncrease(percentageIncrease) {
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
function filterByBHKAndCity(bhk) {
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
function findMaxRentForBHK(rentals, bhk) {
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
function countListingsByCity(data) {
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


    // Your imperative script code here
    if (houseRentArray.length === 0) {
      console.log("Array is empty");
  } else {
      mainMenu1(houseRentArray,rl); // Ensuring this is the entry point of the script
  }


 


