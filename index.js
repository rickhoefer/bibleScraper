
var Promise = require("bluebird");
var axios = require('axios');	
var cheerio = require('cheerio');
var fs = require('fs');

var baseUrl = "https://www.biblegateway.com";

fs.mkdirSync("./books");

axios.get('https://www.biblegateway.com/versions/Reina-Valera-Antigua-RVA-Biblia/#booklist')
.then(response => {
    
    var bookList = getBooks(response.data);
    bookList.forEach(function(book, i) {

        fs.mkdirSync("./books/" + book.name);
        book.chapters.forEach(function(href, chapterNumber) {
                getText(href).then(function(text) {
                fs.writeFile("./books/" + book.name + "/" + chapterNumber + ".txt", text, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                }); 
            });
        });
    });
});

function getText(href) {
    return axios.get(baseUrl + href)
    .then(response => {
        var $ = cheerio.load(response.data);
        return $(".text-html .verse").text();
    });
}

function getBooks(data) {
    var bookList = [];

    var $ = cheerio.load(data);

    $(".nt-book").each(function(bookIndex, book) {
        var bookMap = {
            name: $(book).find(".book-name").text().replace(/\d+$/, ""),
            chapters: []
        };

        $(book).find("a").each(function(i, a) {
            bookMap.chapters.push($(a).prop("href")); 
        });

        bookList.push(bookMap);
    });

 return bookList;
}
