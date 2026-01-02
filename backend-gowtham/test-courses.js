// Quick script to check and fix courses without modules
const { db } = require("./src/config/firebase");

async function checkAndFixCourses() {
  try {
    console.log("Fetching all courses...");
    const snapshot = await db.collection("courses").get();
    
    if (snapshot.empty) {
      console.log("❌ No courses found in database");
      return;
    }

    console.log(`\n📚 Found ${snapshot.size} courses\n`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const courseId = doc.id;
      
      console.log(`\n📖 Course: ${data.title}`);
      console.log(`   ID: ${courseId}`);
      console.log(`   Has modules field: ${!!data.modules}`);
      console.log(`   Modules is array: ${Array.isArray(data.modules)}`);
      console.log(`   Modules count: ${Array.isArray(data.modules) ? data.modules.length : 'N/A'}`);
      
      if (Array.isArray(data.modules) && data.modules.length > 0) {
        console.log(`   ✅ Modules exist:`);
        data.modules.forEach((mod, idx) => {
          console.log(`      ${idx + 1}. ${mod.title || 'Untitled'} (${mod.type || 'video'})`);
        });
      } else {
        console.log(`   ⚠️  No modules found - this course needs modules!`);
        
        // Optionally fix by adding empty modules array
        if (!data.modules || !Array.isArray(data.modules)) {
          console.log(`   🔧 Fixing: Adding empty modules array...`);
          await db.collection("courses").doc(courseId).update({ modules: [] });
          console.log(`   ✅ Fixed!`);
        }
      }
    }
    
    console.log("\n✅ Check complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAndFixCourses();
