export {};

declare global {
  interface Window {
    browserHistory: any;
  }

  type User = {
    uuid: string;
    name: string;
    username: string;
  };

  type Companion = User & {
    connected: boolean;
    disconnected_at?: string;
    user_room: { last_read: string | null };
  };

  type Message = {
    id: string;
    text: string;
    from: string;
    room_id: string;
    created_at: string;
  };

  type Room = {
    id: number;
    companion: string; // second user uuid
    messages: Message[];
    initialized?: boolean; // an indication that the messages have not yet been loaded
    unread_count: number;
  };
}
