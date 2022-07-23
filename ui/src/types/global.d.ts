export {};

declare global {
  interface Window {
    browserHistory: any;
  }

  type User = {
    uuid: string;
    name: string;
    username: string;
    connected: boolean;
    disconnected_at?: string;
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
    users: User[];
    messages: Message[];
    initialized?: boolean;
  };
}
