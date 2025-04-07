#### How to use ####

This testprogram assumes there is a map "testdata" at project root and a subfolderfolder "large_tests".

in testdata is the .json that should be tested.

start script with node run_test.js 'file_to_be_tested.json". Add flags if you want.

### Flags ###

- new:
    The program appends to the test files by default. new overwrites old tests in the folder large_tests.
- batch:
    If you do not want to seperate the JSON objects into different files. They can be wrote to a single file in large_tests.
