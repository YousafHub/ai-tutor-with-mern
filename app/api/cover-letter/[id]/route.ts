// app/api/cover-letter/[id]/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { response, catchError } from "@/lib/helperfunction";
import { CoverLetter } from "@/models/CoverLetter";

// GET - Fetch a single cover letter by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }

    // ✅ Await params to get the id
    const { id } = await params;

    const coverLetter = await CoverLetter.findOne({
      _id: id,
      userId: authUser._id.toString(),
    }).lean();

    if (!coverLetter) {
      return response(false, 404, "Cover letter not found");
    }

    return response(true, 200, "Cover letter fetched successfully", coverLetter);
  } catch (error) {
    return catchError(error);
  }
}

// DELETE - Delete a cover letter by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }

    // ✅ Await params to get the id
    const { id } = await params;

    const coverLetter = await CoverLetter.findOneAndDelete({
      _id: id,
      userId: authUser._id.toString(),
    });

    if (!coverLetter) {
      return response(false, 404, "Cover letter not found");
    }

    return response(true, 200, "Cover letter deleted successfully");
  } catch (error) {
    return catchError(error);
  }
}