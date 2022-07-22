export {};

declare global {
  interface Window {
    browserHistory: any;
  }

  type User = {
    name: string;
    username: string;
    uuid: string;
  };

  type UserRoom = {
    uuid: string;
    name: string;
    connected: boolean;
    disconnected_at?: string;
  };

  type Message = {
    id: string;
    text: string;
    from: string;
    to: string;
    created_at: string;
  };
}
