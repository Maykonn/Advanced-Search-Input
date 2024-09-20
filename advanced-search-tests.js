(function(global, $) {
    const AdvancedSearchTests = {
        testCases: [
            {
                id: 1,
                name: 'Test Case 1: User ID and Username',
                query: 'id = 1 AND username = "john_doe"',
                expected: {
                    filters: [
                        { property: "id", operator: "=", value: "1", andor: null },
                        { property: "username", operator: "=", value: "john_doe", andor: "and" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 2,
                name: 'Test Case 2: User Email or Created At',
                query: 'email = "john@example.com" OR created_at >= "2023-01-01"',
                expected: {
                    filters: [
                        { property: "email", operator: "=", value: "john@example.com", andor: null },
                        { property: "created_at", operator: ">=", value: "2023-01-01", andor: "or" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 3,
                name: 'Test Case 3: Post Title and Content',
                query: 'title = "My First Post" AND content ~ "hello world"',
                expected: {
                    filters: [
                        { property: "title", operator: "=", value: "My First Post", andor: null },
                        { property: "content", operator: "~", value: "hello world", andor: "and" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 4,
                name: 'Test Case 4: Post Title, Content or Created At',
                query: 'title = "My First Post" OR content ~ "hello world" OR created_at >= "2023-01-01"',
                expected: {
                    filters: [
                        { property: "title", operator: "=", value: "My First Post", andor: null },
                        { property: "content", operator: "~", value: "hello world", andor: "or" },
                        { property: "created_at", operator: ">=", value: "2023-01-01", andor: "or" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 5,
                name: 'Test Case 5: Comment Author and Content',
                query: 'author = "jane_doe" AND content ~ "great post"',
                expected: {
                    filters: [
                        { property: "author", operator: "=", value: "jane_doe", andor: null },
                        { property: "content", operator: "~", value: "great post", andor: "and" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 6,
                name: 'Test Case 6: Comment Post ID and Created At',
                query: 'post_id = 1 AND created_at >= "2023-01-01"',
                expected: {
                    filters: [
                        { property: "post_id", operator: "=", value: "1", andor: null },
                        { property: "created_at", operator: ">=", value: "2023-01-01", andor: "and" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 7,
                name: 'Test Case 7: User Created At Descending',
                query: 'ORDER BY created_at DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 8,
                name: 'Test Case 8: User Limited and Offset',
                query: 'LIMIT 5 OFFSET 10',
                expected: {
                    filters: [],
                    sort: [],
                    limit: 5,
                    offset: 10
                }
            },
            {
                id: 9,
                name: 'Test Case 9: Combined Query with Sorting and Pagination',
                query: 'username = "john_doe" AND email = "john@example.com" ORDER BY created_at DESC LIMIT 5 OFFSET 10',
                expected: {
                    filters: [
                        { property: "username", operator: "=", value: "john_doe", andor: null },
                        { property: "email", operator: "=", value: "john@example.com", andor: "and" }
                    ],
                    sort: [
                        { property: "created_at", direction: "DESC" }
                    ],
                    limit: 5,
                    offset: 10
                }
            },
            // Test Cases for Related Attributes
            {
                id: 10,
                name: 'Test Case 10: Single Relation Attribute',
                query: 'posts.created_at = "2023-01-01"',
                expected: {
                    filters: [
                        { property: "posts.created_at", operator: "=", value: "2023-01-01", andor: null }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 11,
                name: 'Test Case 11: Multiple Relation Attributes',
                query: 'posts.created_at = "2023-01-01" AND posts.comments.author = "jane_doe"',
                expected: {
                    filters: [
                        { property: "posts.created_at", operator: "=", value: "2023-01-01", andor: null },
                        { property: "posts.comments.author", operator: "=", value: "jane_doe", andor: "and" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 12,
                name: 'Test Case 12: Mixed Attributes',
                query: 'username = "john_doe" AND posts.title = "My First Post"',
                expected: {
                    filters: [
                        { property: "username", operator: "=", value: "john_doe", andor: null },
                        { property: "posts.title", operator: "=", value: "My First Post", andor: "and" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 13,
                name: 'Test Case 13: Multiple Relations with Logical Operators',
                query: 'posts.title = "My First Post" OR posts.comments.content ~ "great"',
                expected: {
                    filters: [
                        { property: "posts.title", operator: "=", value: "My First Post", andor: null },
                        { property: "posts.comments.content", operator: "~", value: "great", andor: "or" }
                    ],
                    sort: [],
                    limit: null,
                    offset: null
                }
            },
            // Test Cases for Relation Attributes in ORDER BY
            {
                id: 14,
                name: 'Test Case 14: Single Relation Attribute in ORDER BY',
                query: 'ORDER BY posts.created_at DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "posts.created_at", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 15,
                name: 'Test Case 15: Multiple Relation Attributes in ORDER BY',
                query: 'ORDER BY posts.created_at DESC, posts.comments.created_at ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "posts.created_at", direction: "DESC" },
                        { property: "posts.comments.created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 16,
                name: 'Test Case 16: Combined Filters and Relation Attributes in ORDER BY',
                query: 'username = "john_doe" AND ORDER BY posts.created_at DESC',
                expected: {
                    filters: [
                        { property: "username", operator: "=", value: "john_doe", andor: null }
                    ],
                    sort: [
                        { property: "posts.created_at", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            // Extended Test Cases for ORDER BY Clauses
            {
                id: 17,
                name: 'Test Case 17: ORDER BY created_at',
                query: 'ORDER BY created_at',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 18,
                name: 'Test Case 18: ORDER BY created_at ASC',
                query: 'ORDER BY created_at ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 19,
                name: 'Test Case 19: ORDER BY created_at DESC',
                query: 'ORDER BY created_at DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 20,
                name: 'Test Case 20: ORDER BY created_at, posts.created_at',
                query: 'ORDER BY created_at, posts.created_at',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 21,
                name: 'Test Case 21: ORDER BY created_at, posts.created_at ASC',
                query: 'ORDER BY created_at, posts.created_at ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 22,
                name: 'Test Case 22: ORDER BY created_at ASC, posts.created_at ASC',
                query: 'ORDER BY created_at ASC, posts.created_at ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 23,
                name: 'Test Case 23: ORDER BY created_at ASC, posts.created_at',
                query: 'ORDER BY created_at ASC, posts.created_at',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 24,
                name: 'Test Case 24: ORDER BY created_at ASC, posts.created_at DESC',
                query: 'ORDER BY created_at ASC, posts.created_at DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 25,
                name: 'Test Case 25: ORDER BY created_at DESC, posts.created_at ASC',
                query: 'ORDER BY created_at DESC, posts.created_at ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" },
                        { property: "posts.created_at", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 26,
                name: 'Test Case 26: ORDER BY created_at DESC, posts.created_at DESC',
                query: 'ORDER BY created_at DESC, posts.created_at DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" },
                        { property: "posts.created_at", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 27,
                name: 'Test Case 27: ORDER BY created_at DESC, posts.created_at DESC, title ASC',
                query: 'ORDER BY created_at DESC, posts.created_at DESC, title ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" },
                        { property: "posts.created_at", direction: "DESC" },
                        { property: "title", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 28,
                name: 'Test Case 28: ORDER BY created_at, posts.created_at DESC, title ASC',
                query: 'ORDER BY created_at, posts.created_at DESC, title ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "DESC" },
                        { property: "title", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 29,
                name: 'Test Case 29: ORDER BY created_at DESC, posts.created_at, title ASC',
                query: 'ORDER BY created_at DESC, posts.created_at, title ASC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" },
                        { property: "posts.created_at", direction: "ASC" },
                        { property: "title", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 30,
                name: 'Test Case 30: ORDER BY created_at DESC, posts.created_at DESC, title',
                query: 'ORDER BY created_at DESC, posts.created_at DESC, title',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" },
                        { property: "posts.created_at", direction: "DESC" },
                        { property: "title", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 31,
                name: 'Test Case 31: ORDER BY created_at ASC, posts.created_at DESC, title',
                query: 'ORDER BY created_at ASC, posts.created_at DESC, title',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "DESC" },
                        { property: "title", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 32,
                name: 'Test Case 32: ORDER BY created_at DESC, posts.created_at ASC, title',
                query: 'ORDER BY created_at DESC, posts.created_at ASC, title',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" },
                        { property: "posts.created_at", direction: "ASC" },
                        { property: "title", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 33,
                name: 'Test Case 33: ORDER BY created_at, posts.created_at ASC, title DESC',
                query: 'ORDER BY created_at, posts.created_at ASC, title DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "ASC" },
                        { property: "title", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 34,
                name: 'Test Case 34: ORDER BY created_at ASC, posts.created_at ASC, title DESC',
                query: 'ORDER BY created_at ASC, posts.created_at ASC, title DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "ASC" },
                        { property: "title", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 35,
                name: 'Test Case 35: ORDER BY created_at, posts.created_at, title',
                query: 'ORDER BY created_at, posts.created_at, title',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "ASC" },
                        { property: "posts.created_at", direction: "ASC" },
                        { property: "title", direction: "ASC" }
                    ],
                    limit: null,
                    offset: null
                }
            },
            {
                id: 36,
                name: 'Test Case 36: ORDER BY created_at, posts.created_at, title DESC',
                query: 'ORDER BY created_at DESC, posts.created_at DESC, title DESC',
                expected: {
                    filters: [],
                    sort: [
                        { property: "created_at", direction: "DESC" },
                        { property: "posts.created_at", direction: "DESC" },
                        { property: "title", direction: "DESC" }
                    ],
                    limit: null,
                    offset: null
                }
            }
        ],
        run(parseQuery, config) {
            // Filter tests based on the config
            const testsToRun = config.testIds && config.testIds.length > 0
                ? this.testCases.filter(test => config.testIds.includes(test.id))
                : this.testCases;

            testsToRun.forEach((test, index) => {
                const result = parseQuery(test.query);
                const passed = JSON.stringify(result) === JSON.stringify(test.expected);
                                console.log(`${test.name} (ID: ${test.id}): ${passed ? 'Passed' : 'Failed'}`);
                if (!passed) {
                    console.log(`Test ID: ${test.id}`);
                    console.log('Expected:', JSON.stringify(test.expected, null, 2));
                    console.log('Received:', JSON.stringify(result, null, 2));
                }
            });
        }
    }
    
    global.AdvancedSearchTests = AdvancedSearchTests;
}(window, jQuery));
