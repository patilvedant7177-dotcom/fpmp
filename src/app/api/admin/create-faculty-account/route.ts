import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { email, name, profileId } = await request.json();

    if (!email || !profileId) {
      return NextResponse.json({ error: "Email and Profile ID are required" }, { status: 400 });
    }

    // 1. Check if profile exists and if it already has a user_id
    const { data: profile, error: pError } = await supabaseAdmin
      .from('faculty_profiles')
      .select('user_id, name')
      .eq('id', profileId)
      .single();

    if (pError || !profile) {
      return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
    }

    if (profile.user_id) {
      return NextResponse.json({ error: "Account already exists for this profile" }, { status: 400 });
    }

    // 2. Check if auth user already exists with this email
    // Note: getUserByEmail is not available in the admin API directly in this way, 
    // but we can try to create and handle the error, or list users.
    // For simplicity, we'll try to create the user.

    const tempPassword = "ChangeMe@" + Math.floor(1000 + Math.random() * 9000);

    const { data: userData, error: uError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        role: 'faculty',
        full_name: name || profile.name
      }
    });

    if (uError) {
      // If user already exists, we might want to link them if they are not linked
      if (uError.message.includes("already has been registered")) {
        // Find the user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          // Link existing user to profile
          const { error: linkError } = await supabaseAdmin
            .from('faculty_profiles')
            .update({ user_id: existingUser.id })
            .eq('id', profileId);
            
          if (linkError) throw linkError;
          
          return NextResponse.json({ 
            success: true, 
            message: "Existing account linked to profile",
            linked: true 
          });
        }
      }
      throw uError;
    }

    const newUser = userData.user;

    // 3. Link the new user to the faculty profile
    const { error: linkError } = await supabaseAdmin
      .from('faculty_profiles')
      .update({ user_id: newUser.id })
      .eq('id', profileId);

    if (linkError) throw linkError;

    // 4. Send email with credentials
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fpmp.crce.org";

      if (resend && fromEmail) {
        await resend.emails.send({
          from: `FPMP Portal <${fromEmail}>`,
          to: email,
          subject: "Your Faculty Portal Account is Ready",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Welcome to the Faculty Performance Management Portal</h2>
              <p>Hello ${name || profile.name},</p>
              <p>Your official account has been created by the administrator. You can now log in to manage your academic profile.</p>
              <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Username:</strong> ${email}</p>
                <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              <p>Please log in here: <a href="${appUrl}/login/faculty">${appUrl}/login/faculty</a></p>
              <p><em>Note: You will be asked to change your password after your first login (or you can do so in your profile settings).</em></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #777;">Fr. Conceicao Rodrigues College of Engineering</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.warn("Failed to send welcome email:", emailErr);
    }

    // 5. Log the action
    await supabaseAdmin.from('audit_log').insert({
      faculty_id: profileId,
      actor: "admin",
      action: "account_created",
      detail: `Account created for ${email}`
    });

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully",
      username: email,
      tempPassword: tempPassword
    });

  } catch (err: any) {
    console.error("Error creating faculty account:", err);
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}
