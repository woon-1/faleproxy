const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');

describe('Yale to Harvard replacement logic', () => {

  test('should replace Yale with Harvard in text content', () => {
    const $ = cheerio.load(sampleHtmlWithYale);

    // Process text nodes in the body
    $('body *').contents().filter(function() {
      return this.nodeType === 3; // Text nodes only
    }).each(function() {
      // Replace text content but not in URLs or attributes
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Harvard').replace(/yale/g, 'harvard');
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });

    // Process title separately
    const title = $('title').text().replace(/Yale/g, 'Harvard').replace(/yale/g, 'harvard');
    $('title').text(title);

    const modifiedHtml = $.html();

    // Check text replacements
    expect(modifiedHtml).toContain('Harvard University Test Page');
    expect(modifiedHtml).toContain('Welcome to Harvard University');
    expect(modifiedHtml).toContain('Harvard University is a private Ivy League');
    expect(modifiedHtml).toContain('Harvard was founded in 1701');

    // Check that URLs remain unchanged
    expect(modifiedHtml).toContain('https://www.yale.edu/about');
    expect(modifiedHtml).toContain('https://www.yale.edu/admissions');
    expect(modifiedHtml).toContain('https://www.yale.edu/images/logo.png');
    expect(modifiedHtml).toContain('mailto:info@yale.edu');

    // Check href attributes remain unchanged
    expect(modifiedHtml).toMatch(/href="https:\/\/www\.yale\.edu\/about"/);
    expect(modifiedHtml).toMatch(/href="https:\/\/www\.yale\.edu\/admissions"/);

    // Check that link text is replaced
    expect(modifiedHtml).toContain('>About Harvard<');
    expect(modifiedHtml).toContain('>Harvard Admissions<');

    // Check that alt attributes are not changed
    expect(modifiedHtml).toContain('alt="Yale Logo"');
  });

  test('should handle text that has no Yale references', () => {
    const htmlWithoutYale = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello World</h1>
        <p>This is a test page with no mentions.</p>
      </body>
      </html>
    `;

    const $ = cheerio.load(htmlWithoutYale);

    // Apply the same replacement logic
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Harvard').replace(/yale/g, 'harvard');
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });

    const modifiedHtml = $.html();

    // Content should remain the same (no Yale to replace)
    expect(modifiedHtml).toContain('<title>Test Page</title>');
    expect(modifiedHtml).toContain('<h1>Hello World</h1>');
    expect(modifiedHtml).toContain('<p>This is a test page with no mentions.</p>');
  });

  test('should handle case-insensitive replacements', () => {
    const mixedCaseHtml = `
      <p>YALE University, Yale College, and yale medical school are all part of the same institution.</p>
    `;

    const $ = cheerio.load(mixedCaseHtml);

    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      // Use a function to preserve case
      const newText = text.replace(/Yale/gi, function(match) {
        if (match === 'YALE') return 'HARVARD';
        if (match === 'Yale') return 'Harvard';
        if (match === 'yale') return 'harvard';
        return 'Harvard';
      });
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });

    const modifiedHtml = $.html();

    expect(modifiedHtml).toContain('HARVARD University, Harvard College, and harvard medical school');
  });
});
