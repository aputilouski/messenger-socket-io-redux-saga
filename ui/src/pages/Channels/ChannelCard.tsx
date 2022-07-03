import { Avatar, Paper, Badge, ButtonBase, styled } from '@mui/material';

const ChannelCard = () => (
  <ButtonBase component={Paper} elevation={4} sx={{ borderRadius: 1 }}>
    <div className="flex gap-4 w-full py-2.5 px-3.5">
      <div className="self-center">
        <StyledBadge //
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot">
          <Avatar>U</Avatar>
        </StyledBadge>
      </div>
      <div className="grow">
        <div className="flex justify-between mb-1">
          <p>User Name</p>
          <p className="text-xs text-gray-600">12/12/12</p>
        </div>
        <div className="flex justify-between text-xs ">
          <p className="grow text-gray-600">Last message text...</p>
          <p className="font-bold text-white bg-secondary rounded-full p-1 leading-none w-5 text-center">1</p>
        </div>
      </div>
    </div>
  </ButtonBase>
);

export default ChannelCard;

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    'backgroundColor': '#44b700',
    'color': '#44b700',
    'boxShadow': `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));
