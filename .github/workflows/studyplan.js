async function generatePlan() {

    const goal = document.getElementById("goal").value;
    const days = document.getElementById("days").value;

    if(goal === "" || days === ""){
        alert("Please enter both Goal and Number of Days.");
        return;
    }

    document.getElementById("studyResult").innerHTML =
        "⏳ Generating your AI Study Plan...";

    try{

        const response = await fetch("http://localhost:3000/studyplan",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

           body: JSON.stringify({
    goal,
    days,
    email: localStorage.getItem("email")
})
        });

        const data = await response.json();

        document.getElementById("studyResult").innerHTML = `
            <div class="ai-box">
                ${data.plan}
            </div>
        `;

    }
    catch(error){

        document.getElementById("studyResult").innerHTML =
        "❌ Unable to generate study plan.";

    }

}