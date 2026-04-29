import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal-versions";

export const runtime = "nodejs";

interface ConsentBody {
  termsVersion: string;
  privacyVersion: string;
  childDataConsent: boolean;
  marketingConsent: boolean;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!idToken) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const body = (await request.json()) as ConsentBody;

    if (!body.childDataConsent) {
      return NextResponse.json(
        { error: "Child data consent is required to use KidSpark" },
        { status: 400 }
      );
    }

    if (
      body.termsVersion !== TERMS_VERSION ||
      body.privacyVersion !== PRIVACY_VERSION
    ) {
      return NextResponse.json(
        {
          error:
            "Policy version mismatch. Please refresh the page and try again.",
        },
        { status: 409 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const consentRecord = {
      uid,
      email: decoded.email ?? null,
      acceptedAt: FieldValue.serverTimestamp(),
      ipAddress: ip,
      userAgent,
      termsVersion: body.termsVersion,
      privacyVersion: body.privacyVersion,
      childDataConsent: true,
      childDataConsentAt: FieldValue.serverTimestamp(),
      marketingConsent: body.marketingConsent ?? false,
    };

    const db = getAdminDb();

    await db
      .collection("users")
      .doc(uid)
      .collection("consent")
      .doc("v1")
      .set(consentRecord, { merge: false });

    await db.collection("users").doc(uid).set(
      {
        consent: {
          accepted: true,
          termsVersion: body.termsVersion,
          privacyVersion: body.privacyVersion,
          childDataConsent: true,
          acceptedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[user/consent]", error);
    return NextResponse.json(
      { error: "Failed to record consent" },
      { status: 500 }
    );
  }
}
