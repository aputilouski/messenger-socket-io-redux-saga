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

  type Message = {
    id: string;
    text: string;
    from: string;
    to: string;
    created_at: string;
  };
}
