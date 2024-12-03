import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";
import clientPromise from "@/lib/mongodb";

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    // Path to the scraper file
    const scraperPath = path.resolve(
      process.cwd(),
      "src/app/api/webScrape/csMajor.js"
    );

    // Execute the scraper script
    const { stdout, stderr } = await execAsync(`node ${scraperPath}`);

    if (stderr) {
      console.error("Error from scraper script:", stderr);
      return NextResponse.json(
        { message: "Error executing scraper script", error: stderr },
        { status: 500 }
      );
    }

    // Parse the output from the scraper
    const scrapedData = JSON.parse(stdout);

    // Transform the data into the required format
    const transformedData = scrapedData.map((course: any) => ({
      name: course.courseName,
      department: "CS",
      credits: {
        fall: course.fallHours || "0",
        spring: course.springHours || "0",
      },
      offeredSemesters: {
        fall: course.fallHours !== "–",
        spring: course.springHours !== "–",
      },
      description: course.description,
    }));

    // Insert the data into MongoDB
    const client = await clientPromise;
    const db = client.db("ClassesData"); // Ensure the database name matches your setup
    const collection = db.collection("CS_Courses");

    // Insert all the transformed data
    const insertResult = await collection.insertMany(transformedData);

    return NextResponse.json({
      message: "Courses scraped and inserted successfully",
      insertedCount: insertResult.insertedCount,
    });
  } catch (error) {
    console.error("Error in route handler:", error);
    return NextResponse.json(
      { message: "Error in route handler"},
      { status: 500 }
    );
  }
}
