import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat/ChatRoom";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get or create default room
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  const defaultRoom = rooms?.[0];

  if (!defaultRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chưa có phòng chat</h2>
          <p className="text-muted-foreground">
            Vui lòng chạy SQL migration để tạo phòng chat mặc định.
          </p>
        </div>
      </div>
    );
  }

  // Get initial messages
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      profiles:user_id (
        id,
        email,
        display_name,
        avatar_url
      )
    `)
    .eq("room_id", defaultRoom.id)
    .order("created_at", { ascending: true })
    .limit(100);

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ChatRoom
      currentUser={user}
      currentProfile={profile}
      room={defaultRoom}
      initialMessages={messages || []}
    />
  );
}
