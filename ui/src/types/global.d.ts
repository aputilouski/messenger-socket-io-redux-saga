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
    text: string;
  };
}
