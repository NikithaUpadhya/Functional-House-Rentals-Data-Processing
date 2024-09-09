# Functional-House-Rentals-Data-Processing
This repository contains a JavaScript program designed to analyze and manipulate a dataset of house rentals. The program features advanced filtering, sorting, and reporting capabilities and utilizes functional programming concepts to process rental data. It supports both functional and imperative programming approaches for comparison.

# Features
- Pagination: Display large datasets with pagination to improve readability.
- Sorting: Sort rentals by rent, city, and BHK (bedroom-hall-kitchen) configurations.
- Filtering: Filter rentals by rent range, BHK, city, and furnishing status.
- Reporting: Generate detailed reports, such as:
- Average rent by city.
- Average rent per BHK category.
- Top 3 cities with the most rentals.
- Listings with the maximum size.
- Percentage of each furnishing type in each city.
- Curried and Recursive Functions: Implement advanced functional programming concepts like currying and recursion for filtering and data analysis.

# Program Structure
Functional Programming Features
- Sorting Functions: Functions to sort rentals by rent in ascending and descending order.
- Filtering Functions: Functions to filter rentals by city, rent range, BHK, and furnishing status.
- Curried Functions: Curried functions to apply incremental rent increases or to filter by both BHK and city.
- Recursive Functions: Recursive implementations to find maximum rent per BHK, count listings by city, and generate advanced reports.
Imperative Programming Features
- Alternative Imperative Implementations: Alongside functional implementations, imperative versions of core functions like sorting, filtering, and reporting are included for comparison.

# Menus
The program includes a command-line interface (CLI) for interacting with the dataset. It provides the following menus:

- Main Menu: Access sorting, filtering, and reporting options.
- Sorting Menu: Sort by rent (ascending or descending) or by city and BHK.
- Filtering Menu: Filter rentals by city, rent range, or BHK.
- Reporting Menu: Generate reports like average rent, top cities, and percentage of furnishing types.

# Start the program by running:

- Run *node MainAssignment.js* in terminal
- Select the reporting menu.
- Choose the option for "Average rent by city."
- The results will be displayed in a paginated table.

Conclusion
This project provides a comprehensive analysis tool for house rental data, using both functional and imperative programming paradigms. It demonstrates the power of functional programming for data manipulation, offering an efficient, scalable approach for working with large datasets.

