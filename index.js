const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

// arrays to pass to html
var templist1 = ["Problem name"];
var templist2 = ["1400"];
var templist3 = ["Link"];
var templist4 = ["1"];
var templist5 = ["165B"];


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/cfstalk.html");
});

app.get("/output", function (req, res) {
    
    res.render("outp", {
        serialnum: templist4,
        proname: templist1,
        prorate: templist2,
        prolinker: templist3,
        linktext: templist5
    });

});

app.post("/output", function (req, res) {
    // res.sendFile(__dirname + "/output.html");
    
    // clear the arrays
    templist1.length = 1;
    templist2.length = 1;
    templist3.length = 1;
    templist4.length = 1;
    templist5.length = 1;

    userhandle = (req.body.userhandle);
    ratingpro = (req.body.rating);
    taguser = (req.body.taginput);
    console.log(userhandle);
    console.log(ratingpro);
    console.log(taguser);
    let countst = 1;
    let endst = 6000;

    const url = "https://codeforces.com/api/user.status?handle=" + userhandle + "&from=" + countst + "&count=" + endst + "#";

    https.get(url, resu => {
        let data = '';
        resu.on('data', chunk => {
            data += chunk;
        });
        resu.on('end', () => {
            data = JSON.parse(data);

            // create the data structures
            const problems = new Set();
            const mymap = new Map();
            const contestidmp = new Map();
            const proindex = new Map();

            tempu = data.result.length;

            for (let i = 0; i < tempu; i++) {
                var temp = data.result[i].problem.name;
                var temprate = data.result[i].problem.rating;
                var checksolve = data.result[i].verdict;
                var taglist = data.result[i].problem.tags;
                var ch = 0;
                for(let j = 0; j < data.result[i].problem.tags.length; j++)
                {
                    if(data.result[i].problem.tags[j]==taguser)
                    {
                        ch = 1;
                    }
                }

                if ((temprate == ratingpro) && (checksolve == "OK") && (ch == 1)) {
                    problems.add(temp);
                    mymap.set(temp, data.result[i].problem.rating);
                    contestidmp.set(temp, data.result[i].contestId);
                    proindex.set(temp, data.result[i].problem.index);
                }
            }

            let counter = 1;
            for (const x of problems.values()) {
                var ratt = mymap.get(x);
                var ctid = contestidmp.get(x);
                var proidx = proindex.get(x);
                templist1.push(x);
                templist2.push(ratt);
                templist4.push(counter);
                // res.write(counter + "  Problem name:  " + x + "         ");
                var prolink = ("https://codeforces.com/problemset/problem/" + ctid + "/" + proidx + "\n");
                var ctidpro = ctid + proidx;
                templist3.push(prolink);
                templist5.push(ctidpro);
                
                // res.write((prolink))
                // res.write("\n");
                counter += 1;
            }

           // console.log(templist1);
            
            // res.sendFile(__dirname + "/views/outp.ejs");
            res.redirect("/output");
            // res.send();
        })



    }).on('error', err => {
        console.log(err.message);
    })

    
});

app.post("/", function (req, res) {
    


});


app.listen(process.env.PORT || 3000, function () {
    console.log("Server started....");
});