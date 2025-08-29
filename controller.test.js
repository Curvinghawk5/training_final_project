const testFile = require("./backend/src/controllers/controllers.js");

test("Test that midnight and midnight works", () => {
    let result = testFile.getCurrentPrice("TSLA");
    expect(result).toBe("");
});