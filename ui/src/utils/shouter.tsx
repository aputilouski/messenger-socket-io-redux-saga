import React from 'react';
import { SnackbarProvider, useSnackbar, ProviderContext, SnackbarContent } from 'notistack';
import { Paper, ButtonBase } from '@mui/material';

let useSnackbarRef: ProviderContext;
const ShouterConfigurator = () => {
  useSnackbarRef = useSnackbar();
  return null;
};

export const ShouterProvider = ({ children }: { children: JSX.Element }) => (
  <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <ShouterConfigurator />
    {children}
  </SnackbarProvider>
);

type MessageCardProps = { text: string; title: string };

export const shout = (message: MessageCardProps) =>
  useSnackbarRef.enqueueSnackbar(message.text, {
    content: key => <MessageCard key={key} message={message} />,
  });

const MessageCard = React.forwardRef<HTMLDivElement, { message: MessageCardProps }>(({ message }, ref) => (
  <SnackbarContent ref={ref} role="alert">
    <ButtonBase component={Paper} elevation={4} sx={{ borderRadius: 1, width: 1, backgroundColor: 'secondary.main' }}>
      <div className="w-72 text-white px-3.5 py-2.5 text-sm">
        <p className="mb-1">{message.title}</p>
        <p className="truncate">{message.text}</p>
      </div>
    </ButtonBase>
  </SnackbarContent>
));
