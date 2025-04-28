"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
const ONE_WEEK = 60 * 60 * 24 * 7; // 7 days

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, // milliseconds
  });
  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
  return {
    success: true,
    message: "Session cookie set successfully.",
  };
}

export async function signUp(parems: SignUpParams) {
  const { uid, name, email } = parems;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead.",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });
    // profileURL,
    // resumeURL,
    // createdAt: new Date().toISOString(),

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error) {
    console.log("Error in creating a user:", error);
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email already in use.",
      };
    }
    return {
      success: false,
      message: "Failed to creating an account. Please try again.",
    };
  } finally {
    console.log("User created successfully.");
  }
}

export async function signIn(parems: SignInParams) {
  const { email, idToken } = parems;
  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. create an account instead.",
      };
    }
    await setSessionCookie(idToken);
  } catch (error) {
    console.log("Error in signing in:", error);
    return {
      success: false,
      message: "Failed to log into an account. Please try again.",
    };
  }
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);
    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}


export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}