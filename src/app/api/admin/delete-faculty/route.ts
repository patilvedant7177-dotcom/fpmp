import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    // 1. Get profile data for cleanup (user_id and storage)
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('faculty_profiles')
      .select('user_id, avatar_url')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const userId = profile?.user_id;
    const avatarUrl = profile?.avatar_url;

    // 2. Collect gallery image URLs for storage cleanup
    const { data: gallery } = await supabaseAdmin
      .from('faculty_gallery')
      .select('image_url')
      .eq('faculty_id', id);

    // 3. Delete from child tables (manual cascade)
    const childTables = [
      'education',
      'publications',
      'projects',
      'awards',
      'certifications',
      'invited_talks',
      'faculty_gallery'
    ];

    for (const table of childTables) {
      try {
        await supabaseAdmin.from(table).delete().eq('faculty_id', id);
      } catch (e) {
        console.warn(`Failed to delete from ${table}:`, e);
      }
    }

    // 4. Delete messages related to this faculty
    try {
      await supabaseAdmin.from('messages').delete().eq('to_faculty', id);
    } catch (e) {
      console.warn("Failed to delete messages:", e);
    }

    // 5. Delete from audit log (optional, but keep it clean)
    try {
      await supabaseAdmin.from('audit_log').delete().eq('faculty_id', id);
    } catch (e) {
      console.warn("Failed to delete audit logs:", e);
    }

    // 6. Cleanup Storage
    try {
      const storagePaths: string[] = [];
      if (avatarUrl) {
        const path = avatarUrl.split('avatars/').pop();
        if (path) storagePaths.push(path);
      }
      if (gallery) {
        gallery.forEach(g => {
          if (g.image_url) {
            const path = g.image_url.split('avatars/').pop();
            if (path) storagePaths.push(path);
          }
        });
      }

      if (storagePaths.length > 0) {
        await supabaseAdmin.storage.from('avatars').remove(storagePaths);
      }
      
      // Also try deleting the user directory if userId exists
      if (userId) {
        const { data: files } = await supabaseAdmin.storage.from('avatars').list(`avatars/${userId}`);
        if (files && files.length > 0) {
          const paths = files.map(f => `avatars/${userId}/${f.name}`);
          await supabaseAdmin.storage.from('avatars').remove(paths);
        }
      }
    } catch (storageErr) {
      console.warn("Storage cleanup error:", storageErr);
    }

    // 7. Delete the profile itself
    const { error: deleteError } = await supabaseAdmin
      .from('faculty_profiles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // 8. Delete the Auth user if it exists
    if (userId) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) {
        console.warn("Failed to delete auth user (it might have been deleted already or doesn't exist):", authError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Critical delete error:", err);
    return NextResponse.json({ 
      error: err.message || "Failed to delete profile",
      details: err.details || ""
    }, { status: 500 });
  }
}
