import { SnackbarProvider, useSnackbar, ProviderContext, OptionsObject, VariantType } from 'notistack';

let useSnackbarRef: ProviderContext;
const NotificationConfigurator = () => {
  useSnackbarRef = useSnackbar();
  return null;
};

export const NotificationProvider = ({ children }: { children: JSX.Element }) => (
  <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <NotificationConfigurator />
    {children}
  </SnackbarProvider>
);

export const notify = {
  toast(msg: string, variant: VariantType = 'default') {
    const options: OptionsObject = { variant };
    useSnackbarRef.enqueueSnackbar(msg, options);
  },
  success(msg: string) {
    this.toast(msg, 'success');
  },
  warning(msg: string) {
    this.toast(msg, 'warning');
  },
  info(msg: string) {
    this.toast(msg, 'info');
  },
  error(msg: string) {
    this.toast(msg, 'error');
  },
};
