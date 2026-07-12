import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { response, catchError } from "@/lib/helperfunction";
import { CoverLetter } from "@/models/CoverLetter";

export async function GET(
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }

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

export async function DELETE(
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }

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