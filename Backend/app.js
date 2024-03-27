const express = require("express");
const app = express();
const path = require("path");
const mongoClient = require("mongoose");
const { log } = require("console");

app.use(express.urlencoded({ extended: false }));

mongoClient
    .connect("mongodb://127.0.0.1:27017/InterviewHub_Database")
    .then(() => {
        console.log("DB is connected");
    })
    .catch(() => {
        console.log("DB is not connected");
    });

const interviewSchema = new mongoClient.Schema({
    studentName: {
        type: String,
        required: true,
    },
    RegNo: {
        type: Number,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    JobType: {
        type: String,
        required: true,
    },
    Role: {
        type: String,
        required: true,
    },
    Package: {
        type: Number,
        required: true,
    },
    Year: {
        type: Number,
        required: true,
    },
    Content: {
        type: String,
        required: true,
    },
    upvoted: {
        type: Number,
        default: 0,
    },
});

const ProblemSchema = new mongoClient.Schema({
    problemLink: {
        type: String,
        required: true,
    },
    RegNo: {
        type: Number,
        required: true,
    },
});

const ProblemModel = mongoClient.model("problem", ProblemSchema);

const InterviewModel = mongoClient.model("Interview", interviewSchema);

const currentDir = __dirname;
let parentDir = path.resolve(currentDir, "..");
parentDir = path.join(parentDir, "Frontend");

app.use(express.static(path.join(parentDir, "assets")));

console.log(path.join(parentDir, "assets"));

app.set("views", path.join(parentDir, "views"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    const interviews = await InterviewModel.find();
    res.render("index", { Interviews: interviews });
});

app.get("/interviews/:regNo", async (req, res) => {
    const interviews = await InterviewModel.find();
    let found = false;

    interviews.forEach((curData) => {
        if (curData.RegNo == req.params.regNo) {
            found = true;
            //console.log("done");
            res.render("read_more", { Details: curData });
        }
    });

    if (!found) {
        res.status(404).send("Not Found");
    }
});

app.get("/problems", async (req, res) => {
    const interviews = await ProblemModel.find();
    res.render("problems", { Interviews: interviews });
});
app.get("/newexperience", (req, res) => {
    res.render("newexperience");
});

app.post("/newExp", async (req, res) => {
    const {
        Name,
        Number,
        CompanyName,
        Type,
        Role,
        Package,
        Year,
        Interview_Exp,
        RegNo,
        Content,
    } = req.body;

    try {
        const interview = await InterviewModel.create({
            studentName: Name,
            RegNo: RegNo,
            phoneNumber: Number,
            companyName: CompanyName,
            JobType: Type,
            Role: Role,
            Package: Package,
            Year: Year,
            Content: Interview_Exp,
        });

        console.log(req.body.Interview_Exp);

        let exp = req.body.Interview_Exp;

        const pattern = /#problem\s+(https?:\/\/[^\s]+)/gi;

        // Array to store matched URLs
        const matchedLinks = [];

        // Execute the regular expression on the input string
        let match;
        while ((match = pattern.exec(exp)) !== null) {
            // Push the matched URL to the array
            let link = match[1];
            const pp = await ProblemModel.create({
                problemLink: link,
                RegNo: req.body.RegNo,
            });

            await pp.save();
        }

        console.log(matchedLinks);

        await interview.save();
        res.redirect("/");
    } catch (err) {
        // If an error occurs, handle it and send an error response
        res.status(500).send(
            "Error sharing interview experience: " + err.message
        );
    }
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(8000, () => {
    console.log("Server is running");
});
