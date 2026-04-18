// Quick test to verify the progress API endpoint
// Open browser console on Study Planner page and run: testProgressAPI()

window.testProgressAPI = async () => {
  const token = localStorage.getItem("token");
  const planId = "YOUR_PLAN_ID_HERE";

  if (!token) {
    console.error("❌ No auth token found!");
    return;
  }

  try {
    console.log("🔍 Testing Progress API...");
    console.log("Token:", token.substring(0, 20) + "...");

    const response = await fetch(
      `http://localhost:5000/api/study-plans/${planId}/progress`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response Status:", response.status);

    const data = await response.json();
    console.log("✅ API Response:", data);

    if (response.ok) {
      console.log("✓ Progress data:", data.stats);
      console.log("✓ Recommendations:", data.recommendations);
    } else {
      console.error("✗ Error:", data);
    }
  } catch (err) {
    console.error("❌ API Test Error:", err);
  }
};

console.log("✅ Test script loaded. Run: testProgressAPI('your-plan-id') in console");
