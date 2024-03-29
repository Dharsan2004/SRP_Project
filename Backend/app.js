const express = require("express");
const app = express();
const path = require("path");
const mongoClient = require("mongoose");
const { log } = require("console");

app.use(express.urlencoded({ extended: false }));

// mongodb+srv://dharsansrinivasan2004:8F94zory5nlNWVVd@interviewdb.2vaivmj.mongodb.net/?retryWrites=true&w=majority&appName=InterviewDB
const URL =
    "mongodb+srv://dharsansrinivasan2004:8F94zory5nlNWVVd@interviewdb.2vaivmj.mongodb.net/?retryWrites=true&w=majority&appName=InterviewDB";
mongoClient
    .connect(URL)
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

ProblemSchema.add({
    upvoted: {
        type: Number,
        default: 0,
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
    const interviews = await InterviewModel.find().sort({ upvoted: -1 });
    res.render("index", { Interviews: interviews });
});

app.get("/companies", async (req, res) => {
    try {
        // Fetch all unique company names from MongoDB
        const companies = await InterviewModel.distinct("companyName");

        // Send the array of company names as a response
        res.json({ companies });
    } catch (error) {
        console.error("Error fetching company names:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// filer on the basis of comapany name
app.get("/companies/:name", async (req, res) => {
    console.log("hey " + req.params.name);
    try {
        let companies;

        if (req.params.name == "all") {
            companies = await InterviewModel.find();
        } else {
            companies = await InterviewModel.find({
                companyName: req.params.name,
            });
        }

        res.render("index", { Interviews: companies });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("Internal server error");
    }
});

// filer on the basis of comapany name
app.get("/InterviewType/:type", async (req, res) => {
    console.log("hey " + req.params.type);
    try {
        let companies = await InterviewModel.find({
            JobType: req.params.type,
        });
        res.render("index", { Interviews: companies });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("Internal server error");
    }
});
//InterviewPackage

app.get("/InterviewPackage/:pack", async (req, res) => {
    const packageType = req.params.pack;
    let companies;

    try {
        if (packageType == "less10") {
            // Find interviews with Package less than 10
            companies = await InterviewModel.find({ Package: { $lt: 10 } });
        } else if (packageType == "midPack") {
            // Find interviews with Package between 10 and 20
            companies = await InterviewModel.find({
                Package: { $gte: 10, $lte: 15 },
            });
        } else {
            // Find interviews with Package greater than 20
            companies = await InterviewModel.find({ Package: { $gt: 15 } });
        }

        // Render the "index" view with the filtered interviews data
        res.render("index", { Interviews: companies });
    } catch (error) {
        // Handle any errors that occur during the query or rendering process
        console.error("Error fetching interviews:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/upvote/interviews/:regNo", async (req, res) => {
    let regNumber = req.params.regNo;

    //console.log(regNumber);

    const interview = await InterviewModel.findOne({ RegNo: regNumber });

    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    interview.upvoted++;
    await interview.save();

    res.redirect("/");
});

app.get("/upvote/problem/:id", async (req, res) => {
    let id = req.params.id;
    const problems = await ProblemModel.findOne({ _id: id });

    //console.log(id);

    if (!problems) {
        return res.status(404).json({ message: "Interview not found" });
    }

    problems.upvoted++;
    await problems.save();

    res.redirect("/problems");
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
    try {
        // Find all interviews and sort them based on the upvote count in descending order
        const interviews = await ProblemModel.find().sort({ upvoted: -1 });

        //console.log(interviews);

        // Render the "problems" view with the sorted interviews data
        res.render("problems", { Interviews: interviews });
    } catch (error) {
        // Handle any errors that occur during the query or rendering process
        console.error("Error fetching interviews:", error);
        res.status(500).send("Internal server error");
    }
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
