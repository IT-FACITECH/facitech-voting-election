import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emp_id, election_id } = await req.json();

    if (!emp_id || !election_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Initialize supabase client
    const supabase = getSupabase();

    // 1. Fetch Employee Data to verify
    const employee = await prisma.employees.findUnique({
      where: { emp_id },
    });

    if (!employee) {
      return NextResponse.json({ error: "ไม่พบข้อมูลพนักงาน" }, { status: 404 });
    }

    // 1.1 Check if already registered for this election
    const existingCandidate = await prisma.candidates.findFirst({
      where: {
        election_id,
        create_by: emp_id,
      },
    });

    if (existingCandidate) {
      return NextResponse.json({ error: "พนักงานท่านนี้ได้ลงทะเบียนเป็นผู้สมัครในการเลือกตั้งนี้แล้ว" }, { status: 400 });
    }

    // 2. Process Image from Clerk to Supabase
    let imageUrl = user.imageUrl;
    
    try {
      // Fetch image from Clerk URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Define path in Supabase bucket 'photo'
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${emp_id}_${Date.now()}.${fileExt}`;
      const filePath = `candidates/${fileName}`;

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('photo')
        .upload(filePath, buffer, {
          contentType: blob.type,
          upsert: true
        });

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        // Fallback to Clerk image URL if upload fails, or throw error
      } else {
        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photo')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }
    } catch (imgError) {
      console.error("Image Processing Error:", imgError);
      // Keep using Clerk URL as fallback
    }

    // 3. Calculate next candidate number for this election
    const lastCandidate = await prisma.candidates.findFirst({
      where: { election_id },
      orderBy: { number: "desc" },
    });
    const nextNumber = lastCandidate ? lastCandidate.number + 1 : 1;

    // 4. Create Candidate in Database
    const candidate = await prisma.candidates.create({
      data: {
        election_id,
        number: nextNumber,
        name: `${employee.name} ${employee.surname}`,
        site: employee.site,
        image_url: imageUrl,
        create_by: emp_id, // บันทึกรหัสพนักงานที่ทำการสมัคร
      }
    });

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Failed to register candidate" }, { status: 500 });
  }
}
