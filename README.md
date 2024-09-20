# Advanced Search Input

## 🌟 Introduction
The Advanced Search Input package is a powerful tool designed to enhance the search capabilities of web applications. It provides users with an intuitive and flexible way to create complex searches without requiring technical knowledge. Whether you're building an e-commerce platform, a content management system, or a complex enterprise application, this package offers a sophisticated search solution adaptable to your unique needs.

## 🚀 Key Features
Read the [Comprehensive Feature Guide](#https://github.com/Maykonn/Advanced-Search-Input/blob/master/PRODUCT.md) for detailed non-technical documentation

### FOR USERS
- **Smart Search Bar**: Effortlessly build complex queries in a single input field
- **Intelligent Suggestions**: Get real-time suggestions as you type
- **Multi-Entity Search**: Search across different types of information in one go
- **Advanced Filtering**: Use a wide range of operators for precise results
- **Date and Time Searches**: User-friendly calendar integration for date-based queries
- **Customizable Results**: Sort and paginate results to your liking
- **Mobile-Friendly**: Consistent experience across all devices

### FOR DEVELOPERS
- **Flexible Configuration**: Easy setup with extensive customization options
- **Powerful Query Parser**: Translate user inputs into structured API requests
- **Relational Data Support**: Handle complex data relationships in searches
- **Customizable UI**: Adapt the search interface to match your application's design
- **Comprehensive Debugging**: Test mode and extensive logging for easy troubleshooting
- **API Integration**: Easly connect with your backend search API

## 📚 Table of Contents
[Installation](#Installation)
[Basic Setup](#Basic Setup)
[Configuration](#Configuration)
[Detailed Feature Guide](#Detailed Feature Guide)
[Customization](#Customization)
[API Integration](#API Integration)
[Advanced Usage](#Advanced Usage)
[Executing Tests](#Executing Tests)
[Complete Example](#Complete Example)
[Benefits](#Benefits)
[Contributing](#Contributing)
[License](#License)

## 📦 Installation
Include the necessary files in your HTML:
```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<link rel="stylesheet" href="path/to/advanced-search.css">
<script src="path/to/advanced-search.js"></script>
<script src="path/to/advanced-search-tests.js"></script>
```

## 🏁 Basic Setup
Add a container for the search input in your HTML:
```html
<div id="advanced-search-container"></div>
```
Initialize the Advanced Search Input in your JavaScript:
```js
$(document).ready(function() {
    AdvancedSearch.init({
        entities: [
            {
                name: "User",
                attributes: {
                    username: {type: "string", rules: ["required"]},
                    email: {type: "string", rules: ["email"]},
                    created_at: {type: "datetime", rules: ["required"]}
                }
            }
        ],
        searchAPI: "/api/advanced-search"
    });
});
```

## ⚙️ Configuration
| Option | Type | Default | Description | Example |
|--------|------|---------|-------------|---------|
| `entities` | Array | `[]` | Defines the structure of your data models | See detailed example below |
| `searchAPI` | String | `'/api/advanced-search/query?filter='` | Endpoint for search queries | `'/api/custom-search'` |
| `testMode` | Boolean | `false` | Enables debug information display | `true` |
| `runTests` | Boolean | `false` | Runs built-in test suite | `true` |
| `testIds` | Array | `[]` | Specific test IDs to run | `[1, 7, 14]` |
| `currentEntity` | String | First entity in `entities` array | Sets the initial entity for search | `'User'` |
| `advancedSearchContainer` | String | `'#advanced-search-container'` | Selector for the search container | `'#custom-search-container'` |
| `customHTML` | String | `null` | Custom HTML for the search interface | See example below |
| `successCallback` | Function | Default success handler | Custom callback for successful searches | See example below |
| `errorCallback` | Function | Default error handler | Custom callback for failed searches | See example below |

### Complete Configuration example

```js
const config = {
    entities: [
        {
            name: "User",
            attributes: {
                id: {type: "integer", rules: ["required", "integer"]},
                username: {type: "string", rules: ["required", "string", "maxLength: 255"]},
                email: {type: "string", rules: ["required", "string", "email", "maxLength: 255"]},
                created_at: {type: "datetime", rules: ["required", "datetime"]}
            },
            relations: {
                posts: {type: "hasMany", model: "Post", foreignKey: "user_id"}
            }
        },
        {
            name: "Post",
            attributes: {
                id: {type: "integer", rules: ["required", "integer"]},
                title: {type: "string", rules: ["required", "string", "maxLength: 255"]},
                content: {type: "text", rules: ["required"]},
                created_at: {type: "datetime", rules: ["required", "datetime"]}
            },
            relations: {
                user: {type: "belongsTo", model: "User", foreignKey: "user_id"},
                comments: {type: "hasMany", model: "Comment", foreignKey: "post_id"}
            }
        },
        {
            name: "Comment",
            attributes: {
                id: {type: "integer", rules: ["required", "integer"]},
                content: {type: "text", rules: ["required"]},
                created_at: {type: "datetime", rules: ["required", "datetime"]}
            },
            relations: {
                post: {type: "belongsTo", model: "Post", foreignKey: "post_id"}
            }
        }
    ],
    searchAPI: '/api/advanced-search',
    testMode: true,
    successCallback: (message, data) => {
        console.log("Search successful:", message);
        displayResults(data);
    },
    errorCallback: (message, data) => {
        console.error("Search failed:", message);
        alert("An error occurred while searching. Please try again.");
    }
}
```


## 📘 Detailed Feature Guide
### USER-FRIENDLY SEARCH INTERFACE
Smart Search Bar: Users can type complex queries in a single, easy-to-use input field.
Intelligent Suggestions: As users type, the system suggests relevant search terms, making it easier to build complex queries.
Help at Your Fingertips: A convenient help icon provides instant access to search tips and available options.

### POWERFUL AND FLEXIBLE SEARCH CAPABILITIES
Multi-Entity Search: Search across different types of information (e.g., user profiles, products, orders) in one query.
Detailed Filtering: Search by specific attributes tailored to your business context.
Comparison Variety: Utilize various comparison types like 'equals', 'not equals', 'greater than', 'less than', and more.
Partial Matching: Find results that partially match search terms using the ~ operator.
Example query:
```txt
username ~ "john" AND (email = "john@example.com" OR created_at > "2023-01-01")
```

### CUSTOMIZABLE DATE AND TIME SEARCHES
Calendar Integration: User-friendly calendar for easy date selection in date-based searches.
Date Range Queries: Find items within specific time periods.
Example:
```txt
created_at >= "2023-01-01" AND created_at < "2023-12-31"
```

### RESULT MANAGEMENT AND DISPLAY
Flexible Sorting: Arrange search results based on multiple criteria.
Customizable Order: Choose ascending or descending order for each sorting option.
Pagination Control: Specify the number of results per page and easily navigate through large result sets.
Example:
```txt
ORDER BY created_at DESC, username ASC LIMIT 20 OFFSET 40
```

### USER-CENTRIC FEATURES
Query Saving and Sharing: Searches are automatically saved in the URL for easy bookmarking and sharing.
Quick Reset: A 'Clear Query' button allows users to start a new search instantly.
Mobile-Friendly Design: The search interface adapts to various screen sizes for a consistent experience across devices.

### RELATION-BASED SEARCHES
Connected Data Queries: Search for items based on related information.
Multi-Level Relationships: Perform searches spanning multiple levels of connected data.
Example:
```txt
users.posts.comments.author = "jane_doe" AND users.posts.title ~ "important"
```

## 🎨 Customization
### VISUAL CUSTOMIZATION
Tailor the look and feel to match your application:
```js
AdvancedSearch.init({
    // ... other options
    customHTML: `
        <div class="custom-search-wrapper">
            <input type="text" id="search-input" placeholder="Search...">
            <button id="search-button">Search</button>
            <button id="clear-button">Clear</button>
            <span id="help-icon">?</span>
        </div>
    `
});
```
### FUNCTIONAL CUSTOMIZATION
Adapt the search behavior to your specific needs:
```js
AdvancedSearch.init({
    // ... other options
    successCallback: (message, data) => {
        console.log("Search successful:", message);
        displayResults(data);
    },
    errorCallback: (message, data) => {
        console.error("Search failed:", message);
        showErrorNotification(data);
    }
});
```

## 🔌 API Integration
Connect the search input to your backend API:
```js
AdvancedSearch.init({
    // ... other options
    searchAPI: '/api/v2/advanced-search'
});
```
The API will receive requests with the following structure:
```txt
GET /api/v2/advanced-search?filter={"filters":[...],"sort":[...],"limit":20,"offset":40}
```
Example API request for a simple query:
```txt
GET /api/v2/advanced-search?filter={"filters":[{"property":"username","operator":"~","value":"john","andor":null}],"sort":[],"limit":null,"offset":null}
```txt
JSON structure for the filter parameter:
```json
{
  "filters": [
    {
      "property": "username",
      "operator": "~",
      "value": "john",
      "andor": null
    }
  ],
  "sort": [],
  "limit": null,
  "offset": null
}
```
For a more complex query:
```txt
GET /api/v2/advanced-search?filter={"filters":[{"property":"username","operator":"~","value":"john","andor":null},{"property":"email","operator":"=","value":"john@example.com","andor":"or"}],"sort":[{"property":"created_at","direction":"DESC"}],"limit":20,"offset":0}
```
```json
{
  "filters": [
    {
      "property": "username",
      "operator": "~",
      "value": "john",
      "andor": null
    },
    {
      "property": "email",
      "operator": "=",
      "value": "john@example.com",
      "andor": "or"
    }
  ],
  "sort": [
    {
      "property": "created_at",
      "direction": "DESC"
    }
  ],
  "limit": 20,
  "offset": 0
}
```
**Your backend should parse this query string and return the appropriate results based on your data structure and business logic.**

## 🚀 Advanced Usage
### COMPLEX RELATIONAL QUERIES
```js
// Find users who have posted articles about 'JavaScript' and received comments from 'Jane'
const query = 'users.posts.title ~ "JavaScript" AND users.posts.comments.author = "Jane"';

// Find products with high-rated reviews from verified purchasers
const query = 'products.reviews.rating > 4 AND products.reviews.verified_purchase = true';
```
### ADVANCED DATE AND TIME QUERIES
```js
// Find users who registered in 2023 and have been active in the last 30 days
const query = 'users.created_at >= "2023-01-01" AND users.created_at < "2024-01-01" AND users.last_login > "2023-12-01"';

// Find posts created on weekends
const query = 'posts.created_at.dayOfWeek in (1, 7)';

// Find events scheduled for next month
const query = 'events.date >= "2024-02-01" AND events.date < "2024-03-01"';
```
### PAGINATION AND SORTING
```js
// Find the top 10 most commented posts from the last week, sorted by comment count
const query = 'posts.created_at > "2024-01-14" ORDER BY posts.comments.count DESC LIMIT 10';

// Get the second page of users, sorted by registration date
const query = 'ORDER BY users.created_at DESC LIMIT 20 OFFSET 20';

// Complex sorting across multiple entities
const query = 'ORDER BY users.reputation DESC, users.posts.views DESC, users.posts.comments.count DESC LIMIT 15';
```
### COMBINING MULTIPLE ENTITY SEARCHES WITH COMPLEX CONDITIONS
```js
// Find high-value customers who have made large purchases and left positive reviews
const query = '(users.total_spent > 1000 OR users.orders.count > 10) AND users.reviews.rating > 4';

// Find controversial posts with many comments but low ratings
const query = 'posts.comments.count > 50 AND posts.average_rating < 3 ORDER BY posts.comments.count DESC';
```
### USING MULTIPLE LOGICAL OPERATORS
```js
// Find active users who are either premium members or have made a purchase in the last month
const query = 'users.is_active = true AND (users.membership_type = "premium" OR users.last_purchase_date > "2023-12-15")';

// Find products that are either out of stock or low in inventory, and have high demand
const query = '(products.stock_count = 0 OR products.stock_count < products.reorder_level) AND products.demand_score > 8';
```
### NESTED RELATIONAL QUERIES
```js
// Find authors who have books with chapters that mention "artificial intelligence"
const query = 'authors.books.chapters.content ~ "artificial intelligence"';

// Find departments with employees who have completed projects ahead of schedule
const query = 'departments.employees.projects.completion_date < departments.employees.projects.deadline';
```
These examples demonstrate the versatility and power of the Advanced Search Input package. Users can create highly specific and complex queries to extract precisely the information they need, enhancing the overall functionality and user experience of your application.

## 🧪 Executing Tests
The Advanced Search Input package includes a comprehensive test suite to ensure its functionality. To run the tests:
1) Enable test mode in your initialization:
```js
AdvancedSearch.init({
    // ... other options
    testMode: true,
    runTests: true
});
```
2) Optionally, you can specify which tests to run:
```js
AdvancedSearch.init({
    // ... other options
    testMode: true,
    runTests: true,
    testIds: [1, 7, 14] // Run only tests with these IDs
});
```
Check the console for test results. Each test will output whether it passed or failed, along with details of any failures.

## 🌟 Complete Example
Here's a comprehensive example showcasing various features of the Advanced Search Input:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Search Example</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="path/to/advanced-search.css">
    <script src="path/to/advanced-search.js"></script>
    <script src="path/to/advanced-search-tests.js"></script>
</head>
<body>
    <div id="advanced-search-container"></div>
    <div id="results-container"></div>

    <script>
        $(document).ready(function() {
            AdvancedSearch.init({
                entities: [
                    {
                        name: "User",
                        attributes: {
                            id: {type: "integer", rules: ["required", "integer"]},
                            username: {type: "string", rules: ["required", "string", "maxLength: 255"]},
                            email: {type: "string", rules: ["required", "string", "email", "maxLength: 255"]},
                            created_at: {type: "datetime", rules: ["required", "datetime"]}
                        },
                        relations: {
                            posts: {type: "hasMany", model: "Post", foreignKey: "user_id"}
                        }
                    },
                    {
                        name: "Post",
                        attributes: {
                            id: {type: "integer", rules: ["required", "integer"]},
                            title: {type: "string", rules: ["required", "string", "maxLength: 255"]},
                            content: {type: "text", rules: ["required"]},
                            created_at: {type: "datetime", rules: ["required", "datetime"]}
                        },
                        relations: {
                            user: {type: "belongsTo", model: "User", foreignKey: "user_id"},
                            comments: {type: "hasMany", model: "Comment", foreignKey: "post_id"}
                        }
                    },
                    {
                        name: "Comment",
                        attributes: {
                            id: {type: "integer", rules: ["required", "integer"]},
                            content: {type: "text", rules: ["required"]},
                            created_at: {type: "datetime", rules: ["required", "datetime"]}
                        },
                        relations: {
                            post: {type: "belongsTo", model: "Post", foreignKey: "post_id"}
                        }
                    }
                ],
                searchAPI: '/api/advanced-search',
                testMode: true,
                successCallback: (message, data) => {
                    console.log("Search successful:", message);
                    displayResults(data);
                },
                errorCallback: (message, data) => {
                    console.error("Search failed:", message);
                    alert("An error occurred while searching. Please try again.");
                }
            });

            function displayResults(data) {
                let html = '<h2>Search Results</h2><ul>';
                data.forEach(item => {
                    html += `<li>${item.username} - ${item.email}</li>`;
                });
                html += '</ul>';
                $('#results-container').html(html);
            }
        });
    </script>
</body>
</html>
```
This example sets up an advanced search for users, their posts, and comments. After installed you may try queries like:
```txt
username ~ "john" AND posts.title ~ "important" AND posts.comments.content ~ "great" ORDER BY created_at DESC LIMIT 10
```

## 💼 Benefits
- **Enhanced User Experience**: Powerful yet intuitive search functionality catering to both casual and advanced users.
- **Increased Efficiency**: Users can quickly find precise information, improving productivity and satisfaction.
- **Flexibility and Scalability**: Adapts to various data types and grows with your application's evolving needs.
- **Improved Data Accessibility**: Makes large and complex datasets more manageable and accessible.
- **Easy Integration**: Customizable to align perfectly with your application's design and functionality.
- **Empowered Decision Making**: Enables users to extract valuable insights through advanced search capabilities.

## 🤝 Contributing
We welcome contributions to the Advanced Search Input package! Here's how you can help:
- **Fork the Repository**: Start by forking the project repository to your GitHub account.
- **Clone the Fork**: Clone your fork to your local machine for development.
- **Create a Branch**: Make a new branch for your feature or bug fix.
- **Make Changes**: Implement your feature or fix the bug, and add or update tests as necessary.
- **Run Tests**: Ensure all tests pass by running the test suite.
- **Commit Changes**: Commit your changes with a clear and descriptive commit message.
- **Push to GitHub**: Push your changes to your fork on GitHub.
- **Create a Pull Request**: Submit a pull request from your fork to the main repository.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support
If you encounter any issues or have questions about using the Advanced Search Input package, please:

1) Check the documentation to ensure you're using the package correctly.
2) Look through existing issues on our GitHub repository to see if your question has already been addressed.
3) If you can't find a solution, please open a new issue with a detailed description of your problem, including steps to reproduce it.
4) For commercial support or custom development inquiries, please contact us at maykonn@outlook.com.

## 🙏 Acknowledgements
We would like to thank all the contributors who have helped to make this project better. Your time and effort are greatly appreciated!

<p align="center"> Made with ❤️ by <a href="https://www.linkedin.com/in/maykonnwcandido">Maykonn</a> </p>
<p align="center"> <a href="#advanced-search-input">Back to top</a> </p>









































































