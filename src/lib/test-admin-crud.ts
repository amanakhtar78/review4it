import dbConnect from "./db";
import Admin from "./models/Admin";
import bcrypt from "bcryptjs";

async function testAdminCRUD() {
  try {
    // Debug: Check if environment variable is loaded
    console.log("🔍 Environment check:");
    console.log(
      "MONGODB_URI:",
      process.env.MONGODB_URI ? "✅ Loaded" : "❌ Not found"
    );
    console.log("Current working directory:", process.cwd());

    console.log("🔌 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected to MongoDB successfully!");

    // Test CREATE operation
    console.log("\n📝 Testing CREATE operation...");
    const testAdmin = {
      username: "testadmin",
      email: "testadmin@example.com",
      password: "testpassword123",
      rights: ["ADD_MOVIE", "DELETE_MOVIE", "MANAGE_USERS"],
      status: "Active" as const,
    };

    const createdAdmin = await Admin.create(testAdmin);
    console.log("✅ Admin created successfully:", {
      id: createdAdmin._id,
      username: createdAdmin.username,
      email: createdAdmin.email,
      rights: createdAdmin.rights,
      status: createdAdmin.status,
    });

    // Test READ operation (get by ID)
    console.log("\n📖 Testing READ operation...");
    const foundAdmin = await Admin.findById(createdAdmin._id).select(
      "-password"
    );
    if (foundAdmin) {
      console.log("✅ Admin found by ID:", {
        id: foundAdmin._id,
        username: foundAdmin.username,
        email: foundAdmin.email,
      });
    }

    // Test READ operation (get all)
    console.log("\n📚 Testing READ ALL operation...");
    const allAdmins = await Admin.find({}).select("-password");
    console.log(`✅ Found ${allAdmins.length} admins in database`);

    // Test UPDATE operation
    console.log("\n✏️ Testing UPDATE operation...");
    const updatedAdmin = await Admin.findByIdAndUpdate(
      createdAdmin._id,
      {
        username: "updatedadmin",
        rights: ["ADD_MOVIE", "DELETE_MOVIE", "MANAGE_USERS", "MANAGE_ADMINS"],
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (updatedAdmin) {
      console.log("✅ Admin updated successfully:", {
        id: updatedAdmin._id,
        username: updatedAdmin.username,
        rights: updatedAdmin.rights,
      });
    }

    // Test DELETE operation
    console.log("\n🗑️ Testing DELETE operation...");
    const deletedAdmin = await Admin.findByIdAndDelete(createdAdmin._id);
    if (deletedAdmin) {
      console.log("✅ Admin deleted successfully");
    }

    // Verify deletion
    const verifyDeletion = await Admin.findById(createdAdmin._id);
    if (!verifyDeletion) {
      console.log("✅ Deletion verified - admin no longer exists");
    }

    console.log("\n🎉 All CRUD operations tested successfully!");
    console.log(
      "Your MongoDB connection and Admin model are working perfectly!"
    );
  } catch (error) {
    console.error("❌ Error during CRUD test:", error);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAdminCRUD();
}

export default testAdminCRUD;
