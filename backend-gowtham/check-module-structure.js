// Check detailed module structure
const { db } = require("./src/config/firebase");

async function checkModuleStructure() {
  try {
    const courseId = "NP5gbYhYXTdhwk28DFGH"; // JAVA TEST course
    const doc = await db.collection("courses").doc(courseId).get();
    
    if (!doc.exists) {
      console.log("Course not found");
      return;
    }
    
    const data = doc.data();
    console.log("\n📚 Course:", data.title);
    console.log("\nModules data:");
    console.log(JSON.stringify(data.modules, null, 2));
    
    console.log("\n\nModule validation:");
    data.modules.forEach((mod, idx) => {
      console.log(`\nModule ${idx + 1}:`);
      console.log(`  ✓ id: ${mod.id || 'MISSING'}`);
      console.log(`  ✓ title: ${mod.title || 'MISSING'}`);
      console.log(`  ✓ type: ${mod.type || 'MISSING'}`);
      console.log(`  ✓ duration: ${mod.duration || 'MISSING'}`);
      console.log(`  ✓ videoUrl: ${mod.videoUrl || 'MISSING'}`);
      console.log(`  ✓ completed: ${mod.completed || false}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkModuleStructure();
