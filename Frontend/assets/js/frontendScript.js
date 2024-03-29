async function upvoteInterview(rN) {
    const regNo = "interviews/" + rN;

    const URL = "http://localhost:8000/upvote/" + regNo;

    try {
        const response = await fetch(URL);
        if (response.ok) {
            // If the response is successful, reload the page
            window.location.reload();
        } else {
            console.error("Failed to upvote interview:", response.statusText);
        }
    } catch (error) {
        console.error("Error upvoting interview:", error);
    }
}

async function upvoteProblem(id) {
    const URL = "http://localhost:8000/upvote/problem/" + id;

    console.log(id);
    try {
        const response = await fetch(URL);
        if (response.ok) {
            // If the response is successful, reload the page
            window.location.reload();
        } else {
            console.error("Failed to upvote problem", response.statusText);
        }
    } catch (error) {
        console.error("Error upvoting problem:", error);
    }
}
