import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { email, name, department, designation } = await request.json();

    if (!email || !name || !department || !designation) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 1. Check if profile or user already exists with this email
    const { data: existingProfile } = await supabaseAdmin
      .from('faculty_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return NextResponse.json({ error: "A faculty profile with this email already exists" }, { status: 400 });
    }

    // 2. Generate slug
    let slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    // Quick check for slug uniqueness in DB
    const { data: slugCheck } = await supabaseAdmin
      .from('faculty_profiles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
      
    if (slugCheck) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 3. Create the Auth User FIRST
    // This avoids conflicts if there is a trigger on auth.users that auto-creates a profile
    const tempPassword = "ChangeMe@" + Math.floor(1000 + Math.random() * 9000);

    const { data: userData, error: uError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        role: 'faculty',
        full_name: name,
        name: name,
        slug: slug,
        department: department,
        designation: designation,
        status: 'approved',
        profile_status: 'draft'
      }
    });

    if (uError) {
      console.error("DEBUG: Auth.admin.createUser failed. Full error:", JSON.stringify(uError, null, 2));
      throw uError;
    }

    const newUser = userData.user;

    // 4. Now handle the faculty profile
    // Check if a profile was automatically created by a trigger
    const { data: existingProfileAfterAuth } = await supabaseAdmin
      .from('faculty_profiles')
      .select('id')
      .eq('user_id', newUser.id)
      .maybeSingle();

    let finalProfileId;

    if (existingProfileAfterAuth) {
      // Update the auto-created profile
      const { error: updateError } = await supabaseAdmin
        .from('faculty_profiles')
        .update({
          name,
          email,
          slug,
          department,
          designation,
          profile_status: 'draft',
          completion: 10
        })
        .eq('id', existingProfileAfterAuth.id);
      
      if (updateError) throw updateError;
      finalProfileId = existingProfileAfterAuth.id;
    } else {
      // Create new profile if trigger didn't do it
      const { data: newProfile, error: pError } = await supabaseAdmin
        .from('faculty_profiles')
        .insert({
          user_id: newUser.id,
          name,
          email,
          slug,
          department,
          designation,
          profile_status: 'draft',
          completion: 10,
        })
        .select()
        .single();

      if (pError || !newProfile) {
        // Cleanup: Delete the user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.id);
        throw new Error(pError?.message || "Failed to create faculty profile");
      }
      finalProfileId = newProfile.id;
    }

    // 5. Send email (optional, using existing logic style)
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fpmp.crce.org";

      if (resend && fromEmail) {
        await resend.emails.send({
          from: `FPMP Portal <${fromEmail}>`,
          to: email,
          subject: "Welcome to the Faculty Portal",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Welcome to the Faculty Performance Management Portal</h2>
              <p>Hello ${name},</p>
              <p>An official account has been created for you. You can now log in to build your academic profile.</p>
              <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Username:</strong> ${email}</p>
                <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              <p>Login here: <a href="${appUrl}/login/faculty">${appUrl}/login/faculty</a></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #777;">Fr. Conceicao Rodrigues College of Engineering</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.warn("Failed to send welcome email:", emailErr);
    }

    // 6. Log the action
    await supabaseAdmin.from('audit_log').insert({
      faculty_id: finalProfileId,
      actor: "admin",
      action: "faculty_invited",
      detail: `New faculty ${name} invited with email ${email}`
    });

    return NextResponse.json({ 
      success: true, 
      message: "Faculty invited successfully",
      username: email,
      tempPassword: tempPassword
    });

  } catch (err: any) {
    console.error("Error inviting faculty:", err);
    return NextResponse.json({ error: err.message || "Failed to invite faculty" }, { status: 500 });
  }
}
